const asyncHandler = require('../utils/asyncHandler');
const Leave = require('../models/Leave');

// @desc    Apply for student leave
// @route   POST /api/leaves
// @access  Private (Student)
const applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

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
  if (status) filter.status = status;

  const leaves = await Leave.find(filter)
    .populate('student', 'name email rollNo department semester')
    .populate('reviewedBy', 'name email')
    .sort({ appliedOn: -1 });

  res.json({
    success: true,
    count: leaves.length,
    data: leaves
  });
});

const { sendNotification } = require('../config/socket');

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

  leave.status = status;
  if (remarks !== undefined) leave.remarks = remarks;
  leave.reviewedBy = req.user._id;

  await leave.save();

  const updated = await Leave.findById(leave._id)
    .populate('student', 'name email rollNo department')
    .populate('reviewedBy', 'name email designation');

  // Trigger real-time notification to the student applicant
  if (updated && updated.student) {
    sendNotification({
      recipientId: updated.student._id,
      title: `Leave Application ${status}`,
      message: `Your ${updated.leaveType || 'absence'} leave application has been ${status.toLowerCase()}.${remarks ? ' Note: ' + remarks : ''}`,
      type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'info',
      eventType: 'LEAVE_STATUS',
      data: {
        leaveId: updated._id,
        leaveType: updated.leaveType,
        status,
        remarks: remarks || ''
      }
    });
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
