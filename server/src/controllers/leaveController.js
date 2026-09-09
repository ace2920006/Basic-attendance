const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const Leave = require('../models/Leave');
const User = require('../models/User');
const {
  notifyLeaveApproved,
  notifyLeaveRejected
} = require('../services/notificationService');
const { recordAuditLog, AUDIT_ACTIONS } = require('../middleware/auditMiddleware');
const { scanUploadedDocument } = require('../services/documentScannerService');
const { secureUploadDir } = require('../middleware/secureUploadMiddleware');

// @desc    Upload document with magic byte inspection & malware scan
// @route   POST /api/leaves/upload-document
// @access  Private (Student / Admin)
const uploadLeaveDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select a document file to upload (PDF, JPG, PNG).');
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const reportedMime = req.file.mimetype;

  // Run comprehensive security scan (magic bytes + heuristic/malware + SHA-256)
  const scanResult = await scanUploadedDocument(filePath, originalName, reportedMime);

  if (!scanResult.isValid || !scanResult.isClean) {
    // Delete quarantined / malicious file immediately
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error('Error removing flagged file:', cleanupErr);
    }

    // Record security audit event
    await recordAuditLog({
      req,
      user: req.user,
      action: AUDIT_ACTIONS.DOCUMENT_MALWARE_FLAGGED,
      resource: 'LeaveDocument',
      originalValue: originalName,
      newValue: 'QUARANTINED',
      transition: 'UPLOAD -> QUARANTINED',
      reason: scanResult.error || 'Malware or signature mismatch detected',
      status: 'FAILED',
      details: {
        filename: originalName,
        threatName: scanResult.threatName,
        scanDetails: scanResult.scanDetails,
        scanEngine: scanResult.scanEngine
      }
    });

    res.status(400).json({
      success: false,
      message: scanResult.error || 'The uploaded file failed security verification and was quarantined.',
      threat: scanResult.threatName,
      details: scanResult.scanDetails
    });
    return;
  }

  // Generate temporary preview token (15 mins)
  const previewToken = jwt.sign(
    {
      fileName: req.file.filename,
      originalName,
      userId: req.user._id
    },
    process.env.JWT_SECRET || 'test_jwt_secret_doc_verification',
    { expiresIn: '30m' }
  );

  // Log successful document upload in audit
  await recordAuditLog({
    req,
    user: req.user,
    action: AUDIT_ACTIONS.DOCUMENT_UPLOADED,
    resource: 'LeaveDocument',
    originalValue: 'NONE',
    newValue: req.file.filename,
    transition: 'NONE -> UPLOADED',
    reason: 'Leave supporting document uploaded and scanned clean',
    status: 'SUCCESS',
    details: {
      originalName,
      storedName: req.file.filename,
      size: scanResult.sizeBytes,
      mimeType: scanResult.detectedMime,
      sha256: scanResult.sha256,
      scanEngine: scanResult.scanEngine
    }
  });

  res.status(201).json({
    success: true,
    message: 'Document uploaded and verified clean.',
    data: {
      originalName,
      storedName: req.file.filename,
      mimeType: scanResult.detectedMime,
      size: scanResult.sizeBytes,
      hash: scanResult.sha256,
      scanStatus: 'CLEAN',
      scanEngine: scanResult.scanEngine,
      scanDetails: scanResult.scanDetails,
      scannedAt: scanResult.scannedAt,
      previewToken
    }
  });
});

// @desc    Apply for student leave (with supporting document)
// @route   POST /api/leaves
// @access  Private (Student)
const applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason, document, documentUrl, documentName } = req.body;

  if (!startDate || !endDate || !reason) {
    res.status(400);
    throw new Error('Please provide start date, end date, and reason for leave');
  }

  // Construct document metadata
  let docData = {
    originalName: '',
    storedName: '',
    filePath: '',
    mimeType: '',
    size: 0,
    hash: '',
    scanStatus: 'PENDING',
    scanEngine: 'Antigravity Heuristic Engine',
    scanDetails: '',
    scannedAt: new Date()
  };

  if (document && document.storedName) {
    docData = {
      originalName: document.originalName || documentName || 'document',
      storedName: document.storedName,
      filePath: path.join(secureUploadDir, document.storedName),
      mimeType: document.mimeType || 'application/pdf',
      size: document.size || 0,
      hash: document.hash || '',
      scanStatus: document.scanStatus || 'CLEAN',
      scanEngine: document.scanEngine || 'Antigravity Heuristic Engine',
      scanDetails: document.scanDetails || 'Pre-upload scan clean',
      scannedAt: document.scannedAt || new Date()
    };
  } else if (documentName) {
    docData.originalName = documentName;
  }

  const leave = await Leave.create({
    student: req.user._id,
    leaveType: leaveType || 'Medical',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
    documentUrl: documentUrl || (docData.storedName ? `/api/leaves/document-stream/${docData.storedName}` : ''),
    documentName: docData.originalName || documentName || '',
    document: docData,
    status: 'Pending',
    verificationStage: 'teacher_review',
    teacherReview: {
      status: 'Pending',
      remarks: ''
    },
    adminVerification: {
      status: 'Pending',
      remarks: ''
    },
    appliedOn: new Date()
  });

  const populatedLeave = await Leave.findById(leave._id).populate('student', 'name email rollNo department semester');

  res.status(201).json({
    success: true,
    data: populatedLeave
  });
});

// @desc    Get logged in student's leave requests
// @route   GET /api/leaves/my
// @access  Private (Student)
const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ student: req.user._id })
    .populate('teacherReview.reviewedBy', 'name email designation')
    .populate('adminVerification.verifiedBy', 'name email designation')
    .populate('reviewedBy', 'name email designation')
    .sort({ appliedOn: -1 });

  res.json({
    success: true,
    count: leaves.length,
    data: leaves
  });
});

// @desc    Get all leave requests (for Admin / Teacher)
// @route   GET /api/leaves
// @access  Private (Teacher/Admin)
const getAllLeaves = asyncHandler(async (req, res) => {
  const { status, stage, search } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (stage && stage !== 'All') {
    filter.verificationStage = stage;
  }

  const leaves = await Leave.find(filter)
    .populate('student', 'name email rollNo department semester guardianName guardianEmail')
    .populate('teacherReview.reviewedBy', 'name email designation')
    .populate('adminVerification.verifiedBy', 'name email designation')
    .populate('reviewedBy', 'name email designation')
    .sort({ appliedOn: -1 });

  // Optional in-memory search for query
  let result = leaves;
  if (search) {
    const q = search.toLowerCase();
    result = leaves.filter(l =>
      l.student?.name?.toLowerCase().includes(q) ||
      l.student?.rollNo?.toLowerCase().includes(q) ||
      l.reason?.toLowerCase().includes(q) ||
      l.leaveType?.toLowerCase().includes(q) ||
      l.document?.hash?.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// @desc    Teacher Review for student leave application
// @route   PUT /api/leaves/:id/teacher-review
// @access  Private (Teacher / Admin)
const teacherReviewLeave = asyncHandler(async (req, res) => {
  const { action, remarks } = req.body;

  if (!['Approved', 'Rejected'].includes(action)) {
    res.status(400);
    throw new Error('Action must be either "Approved" (forward to admin) or "Rejected"');
  }

  const leave = await Leave.findById(req.params.id).populate('student', 'name email rollNo department');

  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  const oldStatus = leave.status;
  const oldStage = leave.verificationStage;

  if (action === 'Approved') {
    leave.teacherReview = {
      status: 'Approved',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      remarks: remarks || 'Leave document verified and approved by faculty. Forwarded for Admin verification.'
    };
    leave.status = 'Teacher Verified';
    leave.verificationStage = 'admin_verification';
  } else {
    leave.teacherReview = {
      status: 'Rejected',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      remarks: remarks || 'Leave request rejected by faculty.'
    };
    leave.status = 'Rejected';
    leave.verificationStage = 'rejected';
  }

  // Sync legacy fields
  leave.reviewedBy = req.user._id;
  leave.remarks = remarks || leave.teacherReview.remarks;

  await leave.save();

  const updated = await Leave.findById(leave._id)
    .populate('student', 'name email rollNo department semester')
    .populate('teacherReview.reviewedBy', 'name email designation')
    .populate('adminVerification.verifiedBy', 'name email designation');

  // Audit Logging
  await recordAuditLog({
    req,
    user: req.user,
    targetUser: leave.student?._id,
    targetUserName: leave.student?.name || 'Student',
    targetUserRollNo: leave.student?.rollNo || '',
    action: AUDIT_ACTIONS.TEACHER_VERIFY_LEAVE,
    resource: 'Leave',
    originalValue: oldStatus,
    newValue: leave.status,
    transition: `${oldStage} -> ${leave.verificationStage}`,
    reason: remarks || `Teacher review: ${action}`,
    status: 'SUCCESS',
    details: {
      leaveId: leave._id,
      action,
      teacherId: req.user._id,
      teacherName: req.user.name,
      remarks: leave.teacherReview.remarks
    }
  });

  // Notifications
  if (action === 'Rejected' && leave.student) {
    await notifyLeaveRejected({
      studentId: leave.student._id,
      leaveType: leave.leaveType,
      startDate: new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      endDate: new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      remarks: remarks || 'Rejected during teacher review',
      reviewerName: req.user.name
    });
  }

  res.json({
    success: true,
    message: action === 'Approved' ? 'Leave verified and forwarded for Admin verification.' : 'Leave request rejected.',
    data: updated
  });
});

// @desc    Admin Final Verification for student leave application
// @route   PUT /api/leaves/:id/admin-verify
// @access  Private (Admin)
const adminVerifyLeave = asyncHandler(async (req, res) => {
  const { action, remarks } = req.body;

  if (!['Verified', 'Approved', 'Rejected'].includes(action)) {
    res.status(400);
    throw new Error('Action must be "Verified" or "Rejected"');
  }

  const isVerified = action === 'Verified' || action === 'Approved';

  const leave = await Leave.findById(req.params.id).populate('student', 'name email rollNo department guardianEmail');

  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  const oldStatus = leave.status;
  const oldStage = leave.verificationStage;

  if (isVerified) {
    leave.adminVerification = {
      status: 'Verified',
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      remarks: remarks || 'Leave application and supporting proof verified and officially sanctioned by Administration.'
    };
    leave.status = 'Approved'; // Final Approved state ensures 100% backward compatibility
    leave.verificationStage = 'completed';
  } else {
    leave.adminVerification = {
      status: 'Rejected',
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      remarks: remarks || 'Leave application rejected by Administration.'
    };
    leave.status = 'Rejected';
    leave.verificationStage = 'rejected';
  }

  // Update legacy fields
  leave.reviewedBy = req.user._id;
  leave.remarks = remarks || leave.adminVerification.remarks;

  await leave.save();

  const updated = await Leave.findById(leave._id)
    .populate('student', 'name email rollNo department semester guardianEmail')
    .populate('teacherReview.reviewedBy', 'name email designation')
    .populate('adminVerification.verifiedBy', 'name email designation');

  // Audit Logging
  await recordAuditLog({
    req,
    user: req.user,
    targetUser: leave.student?._id,
    targetUserName: leave.student?.name || 'Student',
    targetUserRollNo: leave.student?.rollNo || '',
    action: isVerified ? AUDIT_ACTIONS.ADMIN_VERIFY_LEAVE : AUDIT_ACTIONS.REJECT_LEAVE,
    resource: 'Leave',
    originalValue: oldStatus,
    newValue: leave.status,
    transition: `${oldStage} -> ${leave.verificationStage}`,
    reason: remarks || `Admin verification: ${action}`,
    status: 'SUCCESS',
    details: {
      leaveId: leave._id,
      action: isVerified ? 'Verified' : 'Rejected',
      adminId: req.user._id,
      adminName: req.user.name,
      remarks: leave.adminVerification.remarks
    }
  });

  // Notify student
  if (leave.student) {
    const startFmt = new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endFmt = new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (isVerified) {
      await notifyLeaveApproved({
        studentId: leave.student._id,
        leaveType: leave.leaveType,
        startDate: startFmt,
        endDate: endFmt,
        remarks: remarks || 'Officially verified and approved by Administration',
        reviewerName: `${req.user.name} (Administration)`
      });
    } else {
      await notifyLeaveRejected({
        studentId: leave.student._id,
        leaveType: leave.leaveType,
        startDate: startFmt,
        endDate: endFmt,
        remarks: remarks || 'Rejected by Administration',
        reviewerName: `${req.user.name} (Administration)`
      });
    }
  }

  res.json({
    success: true,
    message: isVerified ? 'Leave application verified and sanctioned by Admin.' : 'Leave application rejected.',
    data: updated
  });
});

// @desc    Admin re-scans document on disk for malware/integrity
// @route   POST /api/leaves/:id/rescan
// @access  Private (Admin)
const rescanDocument = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  if (!leave.document || !leave.document.storedName) {
    res.status(400);
    throw new Error('This leave application has no uploaded document attached to scan.');
  }

  const filePath = path.join(secureUploadDir, leave.document.storedName);

  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('Document file not found in secure storage on server.');
  }

  const scanResult = await scanUploadedDocument(
    filePath,
    leave.document.originalName || 'document.pdf',
    leave.document.mimeType || 'application/pdf'
  );

  leave.document.scanStatus = scanResult.isClean ? 'CLEAN' : 'FLAGGED';
  leave.document.hash = scanResult.sha256;
  leave.document.scanEngine = scanResult.scanEngine;
  leave.document.scanDetails = scanResult.scanDetails;
  leave.document.scannedAt = scanResult.scannedAt;

  await leave.save();

  res.json({
    success: true,
    message: scanResult.isClean ? 'Document re-scan passed: Clean.' : 'Security warning: Threat detected.',
    data: leave.document
  });
});

// Helper: Check authorization to view document
const checkDocumentAccess = (user, leave) => {
  if (!user || !leave) return false;

  // Admin and Teacher have academic authorization
  if (user.role === 'admin' || user.role === 'teacher') return true;

  // Student owner
  const studentId = leave.student?._id ? leave.student._id.toString() : leave.student.toString();
  if (user._id.toString() === studentId) return true;

  // Linked parent
  if (user.role === 'parent' && user.linkedStudents && user.linkedStudents.length > 0) {
    return user.linkedStudents.some(s => s.toString() === studentId);
  }

  return false;
};

// @desc    Serve document directly via authenticated private stream
// @route   GET /api/leaves/:id/document
// @access  Private (Student Owner / Teacher / Admin / Linked Parent)
const servePrivateDocument = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  if (!checkDocumentAccess(req.user, leave)) {
    res.status(403);
    throw new Error('Access denied: You do not have permission to access this private document.');
  }

  const storedName = leave.document?.storedName;
  if (!storedName) {
    res.status(404);
    throw new Error('No document attached to this leave application.');
  }

  const filePath = path.join(secureUploadDir, storedName);

  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('Document file could not be located in secure storage.');
  }

  const mimeType = leave.document?.mimeType || 'application/pdf';
  const originalName = leave.document?.originalName || 'leave_document.pdf';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  fs.createReadStream(filePath).pipe(res);
});

// @desc    Generate signed temporary token for private previewing
// @route   GET /api/leaves/:id/document-token
// @access  Private (Student Owner / Teacher / Admin / Linked Parent)
const generateDocumentAccessToken = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  if (!checkDocumentAccess(req.user, leave)) {
    res.status(403);
    throw new Error('Access denied to generate access token for this document.');
  }

  if (!leave.document?.storedName) {
    res.status(400);
    throw new Error('No document is attached to this application.');
  }

  const token = jwt.sign(
    {
      leaveId: leave._id.toString(),
      storedName: leave.document.storedName,
      userId: req.user._id.toString()
    },
    process.env.JWT_SECRET || 'test_jwt_secret_doc_verification',
    { expiresIn: '15m' } // 15-minute expiring signed URL
  );

  res.json({
    success: true,
    token,
    streamUrl: `/api/leaves/document-stream/${token}`,
    expiresIn: '15m'
  });
});

// @desc    Serve document using signed expiring token
// @route   GET /api/leaves/document-stream/:token
// @access  Public (Validated by cryptographic signature and expiration)
const serveDocumentByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_jwt_secret_doc_verification');
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Private document access token has expired or is invalid. Please request a new preview token.'
    });
  }

  const leave = await Leave.findById(decoded.leaveId);
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave record not found.' });
  }

  const storedName = decoded.storedName || leave.document?.storedName;
  const filePath = path.join(secureUploadDir, storedName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found in secure storage.' });
  }

  const mimeType = leave.document?.mimeType || 'application/pdf';
  const originalName = leave.document?.originalName || 'leave_document.pdf';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

  fs.createReadStream(filePath).pipe(res);
});

// @desc    Legacy update leave status (maintained for backward compatibility)
// @route   PUT /api/leaves/:id
// @access  Private (Teacher/Admin)
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;

  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    res.status(400);
    throw new Error('Invalid leave status');
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  // If user is teacher and status is 'Approved', route to teacher verification
  if (req.user.role === 'teacher' && status === 'Approved') {
    req.body.action = 'Approved';
    return teacherReviewLeave(req, res);
  }

  // If user is admin or status is rejected, route to admin verification
  if (req.user.role === 'admin') {
    req.body.action = status === 'Approved' ? 'Verified' : 'Rejected';
    return adminVerifyLeave(req, res);
  }

  leave.status = status;
  if (remarks !== undefined) leave.remarks = remarks;
  leave.reviewedBy = req.user._id;
  await leave.save();

  const updated = await Leave.findById(leave._id).populate('student', 'name email rollNo department');
  res.json({ success: true, data: updated });
});

module.exports = {
  uploadLeaveDocument,
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  teacherReviewLeave,
  adminVerifyLeave,
  rescanDocument,
  servePrivateDocument,
  generateDocumentAccessToken,
  serveDocumentByToken,
  updateLeaveStatus
};
