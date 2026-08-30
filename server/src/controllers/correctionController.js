const asyncHandler = require('../utils/asyncHandler');
const AttendanceCorrection = require('../models/AttendanceCorrection');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const { recordAuditLog, AUDIT_ACTIONS } = require('../middleware/auditMiddleware');
const { sendNotification } = require('../config/socket');

// @desc    Submit an attendance correction request
// @route   POST /api/attendance-corrections
// @access  Private (Teacher/Admin/Student)
const createCorrectionRequest = asyncHandler(async (req, res) => {
  const { attendanceId, requestedStatus, reason } = req.body;

  if (!attendanceId || !requestedStatus || !reason) {
    res.status(400);
    throw new Error('Please provide attendanceId, requestedStatus, and reason');
  }

  const attendance = await Attendance.findById(attendanceId).populate('student', 'name email rollNo');
  if (!attendance) {
    res.status(404);
    throw new Error('Attendance record not found');
  }

  // Create correction request
  const correction = await AttendanceCorrection.create({
    attendance: attendance._id,
    student: attendance.student._id || attendance.student,
    subject: attendance.subject || '',
    date: attendance.date,
    originalStatus: attendance.status,
    requestedStatus,
    reason,
    requestedBy: req.user._id,
    status: 'Pending'
  });

  const studentUser = attendance.student;

  // Log in Audit Trail
  await recordAuditLog({
    req,
    user: req.user,
    targetUser: studentUser?._id || attendance.student,
    targetUserName: studentUser?.name || 'Student',
    targetUserRollNo: studentUser?.rollNo || '',
    action: AUDIT_ACTIONS.ATTENDANCE_CORRECTION_REQUESTED,
    resource: 'AttendanceCorrection',
    originalValue: attendance.status,
    newValue: requestedStatus,
    transition: `${attendance.status} → ${requestedStatus}`,
    reason,
    status: 'SUCCESS',
    details: {
      correctionId: correction._id,
      attendanceId: attendance._id,
      studentId: studentUser?._id || attendance.student,
      studentName: studentUser?.name,
      studentRollNo: studentUser?.rollNo,
      originalStatus: attendance.status,
      requestedStatus,
      transition: `${attendance.status} → ${requestedStatus}`,
      reason
    }
  });

  // Notify student or relevant admin/teacher
  try {
    await sendNotification({
      recipientId: attendance.student._id || attendance.student,
      title: 'Correction Requested',
      message: `A correction request was submitted for ${attendance.subject} (${attendance.status} → ${requestedStatus}).`,
      type: 'info',
      eventType: 'ATTENDANCE_CORRECTION_SUBMITTED',
      data: { correctionId: correction._id, attendanceId: attendance._id }
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }

  const populatedCorrection = await AttendanceCorrection.findById(correction._id)
    .populate('student', 'name email rollNo department')
    .populate('requestedBy', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Attendance correction request submitted successfully',
    data: populatedCorrection
  });
});

// @desc    Get attendance correction requests with filters
// @route   GET /api/attendance-corrections
// @access  Private (Teacher/Admin/Student)
const getCorrectionRequests = asyncHandler(async (req, res) => {
  const { status, studentId, subject, startDate, endDate } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (studentId) filter.student = studentId;
  if (subject) filter.subject = { $regex: subject, $options: 'i' };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // If user is student, only show their own correction requests
  if (req.user.role === 'student') {
    filter.student = req.user._id;
  }

  const corrections = await AttendanceCorrection.find(filter)
    .populate('student', 'name email rollNo department section')
    .populate('requestedBy', 'name email role')
    .populate('reviewedBy', 'name email role')
    .populate('attendance')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: corrections.length,
    data: corrections
  });
});

// @desc    Review (Approve/Reject) an attendance correction request
// @route   PUT /api/attendance-corrections/:id/review
// @access  Private (Teacher/Admin)
const reviewCorrectionRequest = asyncHandler(async (req, res) => {
  const { status, reviewComment } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be Approved or Rejected');
  }

  const correction = await AttendanceCorrection.findById(req.params.id)
    .populate('student', 'name email rollNo department')
    .populate('requestedBy', 'name email role');

  if (!correction) {
    res.status(404);
    throw new Error('Correction request not found');
  }

  if (correction.status !== 'Pending') {
    res.status(400);
    throw new Error(`Correction request has already been ${correction.status.toLowerCase()}`);
  }

  correction.status = status;
  correction.reviewedBy = req.user._id;
  correction.reviewedAt = new Date();
  correction.reviewComment = reviewComment || '';

  await correction.save();

  // If Approved, update original Attendance record status
  if (status === 'Approved') {
    const attendanceDoc = await Attendance.findById(correction.attendance);
    if (attendanceDoc) {
      attendanceDoc.status = correction.requestedStatus;
      attendanceDoc.notes = attendanceDoc.notes 
        ? `${attendanceDoc.notes} (Corrected from ${correction.originalStatus} to ${correction.requestedStatus}: ${correction.reason})`
        : `Corrected from ${correction.originalStatus} to ${correction.requestedStatus}: ${correction.reason}`;
      await attendanceDoc.save();
    }
  }

  const studentUser = correction.student;
  const isApproved = status === 'Approved';
  const newStatus = isApproved ? correction.requestedStatus : correction.originalStatus;
  const transitionStr = `${correction.originalStatus} → ${newStatus}`;

  // Primary audit log: EDIT_ATTENDANCE (or ATTENDANCE_CORRECTION_APPROVED / REJECTED)
  await recordAuditLog({
    req,
    user: req.user,
    targetUser: studentUser?._id || correction.student,
    targetUserName: studentUser?.name || 'Student',
    targetUserRollNo: studentUser?.rollNo || '',
    action: isApproved ? AUDIT_ACTIONS.EDIT_ATTENDANCE : AUDIT_ACTIONS.ATTENDANCE_CORRECTION_REJECTED,
    resource: 'Attendance',
    originalValue: correction.originalStatus,
    newValue: newStatus,
    transition: transitionStr,
    reason: correction.reason || 'Medical document verified',
    status: 'SUCCESS',
    details: {
      correctionId: correction._id,
      attendanceId: correction.attendance,
      studentId: studentUser?._id || correction.student,
      studentName: studentUser?.name,
      studentRollNo: studentUser?.rollNo,
      originalStatus: correction.originalStatus,
      newStatus,
      requestedStatus: correction.requestedStatus,
      transition: transitionStr,
      changedBy: correction.requestedBy?._id || correction.requestedBy,
      changedByName: correction.requestedBy?.name || 'Faculty',
      reason: correction.reason,
      reviewedBy: req.user._id,
      reviewedByName: req.user.name,
      reviewComment: reviewComment || '',
      timestamp: new Date()
    }
  });

  // Notify student & requester
  try {
    await sendNotification({
      recipientId: correction.student._id,
      title: `Attendance Correction ${status}`,
      message: `Your attendance correction for ${correction.subject} was ${status.toLowerCase()}${reviewComment ? `: ${reviewComment}` : '.'}`,
      type: status === 'Approved' ? 'success' : 'error',
      eventType: 'ATTENDANCE_CORRECTION_REVIEWED',
      data: { correctionId: correction._id, status }
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }

  const updatedCorrection = await AttendanceCorrection.findById(correction._id)
    .populate('student', 'name email rollNo department')
    .populate('requestedBy', 'name email role')
    .populate('reviewedBy', 'name email role')
    .populate('attendance');

  res.json({
    success: true,
    message: `Correction request ${status.toLowerCase()} successfully`,
    data: updatedCorrection
  });
});

// @desc    Get complete audit trail for a specific attendance record
// @route   GET /api/attendance-corrections/history/:attendanceId
// @access  Private (Teacher/Admin/Student)
const getAttendanceAuditTrail = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;

  const corrections = await AttendanceCorrection.find({ attendance: attendanceId })
    .populate('requestedBy', 'name email role')
    .populate('reviewedBy', 'name email role')
    .sort({ createdAt: -1 });

  const auditLogs = await AuditLog.find({
    $or: [
      { 'details.attendanceId': attendanceId },
      { 'details.attendance': attendanceId }
    ]
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      corrections,
      auditLogs
    }
  });
});

module.exports = {
  createCorrectionRequest,
  getCorrectionRequests,
  reviewCorrectionRequest,
  getAttendanceAuditTrail
};
