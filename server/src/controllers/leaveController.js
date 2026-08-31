const asyncHandler = require('../utils/asyncHandler');
const Leave = require('../models/Leave');
const {
  notifyLeaveApproved,
  notifyLeaveRejected
} = require('../services/notificationService');
const { recordAuditLog, AUDIT_ACTIONS } = require('../middleware/auditMiddleware');

// @desc    Apply for student leave
// @route   POST /api/leaves
// @access  Private (Student)
const applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason, documentUrl, documentName } = req.body;

  if (!startDate || !endDate || !reason) {
    res.status(400);
    throw new Error('Please provide start date, end date, and reason for leave');
  }

  const leave = await Leave.create({
    student: req.user._id,
    leaveType: leaveType || 'Medical',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
    documentUrl: documentUrl || '',
    documentName: documentName || '',
    status: 'Pending',
    appliedOn: new Date()
  });

  const populatedLeave = await Leave.findById(leave._id).populate('student', 'name email rollNo department');

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
  const { status } = req.query;
  const filter = {};
  if (status && status !== 'All') filter.status = status;

  const leaves = await Leave.find(filter)
    .populate('student', 'name email rollNo department semester')
    .populate('reviewedBy', 'name email designation')
    .sort({ appliedOn: -1 });

  res.json({
    success: true,
    count: leaves.length,
    data: leaves
  });
});

// @desc    Approve or reject leave request
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

  const oldStatus = leave.status;
  leave.status = status;
  if (remarks !== undefined) leave.remarks = remarks;
  leave.reviewedBy = req.user._id;

  await leave.save();

  const updated = await Leave.findById(leave._id)
    .populate('student', 'name email rollNo department')
    .populate('reviewedBy', 'name email designation');

  const studentDoc = updated?.student;
  const auditAction = status === 'Approved' ? AUDIT_ACTIONS.APPROVE_LEAVE : AUDIT_ACTIONS.REJECT_LEAVE;
  const transitionStr = `${oldStatus} → ${status}`;

  await recordAuditLog({
    req,
    user: req.user,
    targetUser: studentDoc?._id || leave.student,
    targetUserName: studentDoc?.name || 'Student',
    targetUserRollNo: studentDoc?.rollNo || '',
    action: auditAction,
    resource: 'Leave',
    originalValue: oldStatus,
    newValue: status,
    transition: transitionStr,
    reason: remarks || leave.reason || `${status} leave application`,
    status: 'SUCCESS',
    details: {
      leaveId: leave._id,
      studentId: studentDoc?._id || leave.student,
      studentName: studentDoc?.name,
      studentRollNo: studentDoc?.rollNo,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      leaveReason: leave.reason,
      remarks: remarks || '',
      reviewedBy: req.user._id,
      reviewedByName: req.user.name,
      reviewedByRole: req.user.role,
      status
    }
  });

  // Trigger multi-channel notification to the student applicant
  if (updated && updated.student) {
    const studentId = updated.student._id || updated.student;
    const startDateFormatted = new Date(updated.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const endDateFormatted = new Date(updated.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (status === 'Approved') {
      await notifyLeaveApproved({
        studentId,
        leaveType: updated.leaveType || 'Medical',
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        remarks: remarks || '',
        reviewerName: req.user.name || 'Faculty Advisor'
      });
    } else if (status === 'Rejected') {
      await notifyLeaveRejected({
        studentId,
        leaveType: updated.leaveType || 'Medical',
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        remarks: remarks || '',
        reviewerName: req.user.name || 'Faculty Advisor'
      });
    }
  }

  res.json({
    success: true,
    data: updated
  });
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
