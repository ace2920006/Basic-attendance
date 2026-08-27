const asyncHandler = require('../utils/asyncHandler');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const AttendanceSession = require('../models/AttendanceSession');
const { sendNotification } = require('../config/socket');

// @desc    Get flagged / suspicious attendance records for review
// @route   GET /api/anti-proxy/flagged
// @access  Private (Teacher/Admin)
const getFlaggedAttendanceRecords = asyncHandler(async (req, res) => {
  const {
    riskLevel = 'all',
    reviewStatus = 'all',
    classId,
    subjectCode,
    search = ''
  } = req.query;

  const filter = {};

  // If teacher, show records for classes/sessions they teach or marked
  if (req.user.role === 'teacher') {
    const Class = require('../models/Class');
    const teacherSessions = await AttendanceSession.find({ teacher: req.user._id }).select('_id');
    const teacherClasses = await Class.find({ instructorId: req.user._id }).select('_id');
    const sessionIds = teacherSessions.map((s) => s._id);
    const classIds = teacherClasses.map((c) => c._id);

    filter.$or = [
      { markedBy: req.user._id },
      { sessionId: { $in: sessionIds } },
      { classId: { $in: classIds } }
    ];
  }

  if (riskLevel && riskLevel !== 'all') {
    filter.riskLevel = riskLevel;
  } else if (reviewStatus === 'all' && riskLevel === 'all') {
    // By default for flagged view, query records that are suspicious/high risk or pending review
    filter.$or = filter.$or
      ? filter.$or.map((cond) => ({ ...cond, $or: [{ riskLevel: { $in: ['Suspicious', 'High Risk'] } }, { reviewStatus: 'Pending' }] }))
      : [{ riskLevel: { $in: ['Suspicious', 'High Risk'] } }, { reviewStatus: 'Pending' }];
  }

  if (reviewStatus && reviewStatus !== 'all') {
    filter.reviewStatus = reviewStatus;
  }

  if (classId) filter.classId = classId;
  if (subjectCode) filter.subjectCode = subjectCode.toUpperCase();

  let records = await Attendance.find(filter)
    .populate('student', 'name rollNo email department avatar')
    .populate('reviewedBy', 'name email role')
    .sort({ createdAt: -1 });

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    records = records.filter(
      (r) =>
        r.student?.name?.toLowerCase().includes(q) ||
        r.student?.rollNo?.toLowerCase().includes(q) ||
        r.subject?.toLowerCase().includes(q) ||
        r.subjectCode?.toLowerCase().includes(q) ||
        r.riskSignals?.some((s) => s.reason?.toLowerCase().includes(q))
    );
  }

  // Summary metadata
  const totalPending = records.filter((r) => r.reviewStatus === 'Pending').length;
  const highRiskCount = records.filter((r) => r.riskLevel === 'High Risk').length;
  const suspiciousCount = records.filter((r) => r.riskLevel === 'Suspicious').length;

  res.json({
    success: true,
    count: records.length,
    summary: {
      totalRecords: records.length,
      totalPending,
      highRiskCount,
      suspiciousCount
    },
    data: records
  });
});

// @desc    Review & Approve / Reject a flagged attendance record
// @route   PUT /api/anti-proxy/review/:id
// @access  Private (Teacher/Admin)
const reviewAttendanceRecord = asyncHandler(async (req, res) => {
  const { action, notes } = req.body;

  if (!action || !['approve', 'reject'].includes(action.toLowerCase())) {
    res.status(400);
    throw new Error("Action must be either 'approve' or 'reject'");
  }

  const record = await Attendance.findById(req.params.id).populate('student', 'name email');

  if (!record) {
    res.status(404);
    throw new Error('Attendance record not found');
  }

  const isApprove = action.toLowerCase() === 'approve';

  record.reviewStatus = isApprove ? 'Approved' : 'Rejected';
  if (!isApprove) {
    record.status = 'Absent';
  } else if (record.status === 'Absent' || record.status === 'Cancelled Lecture') {
    record.status = 'Present';
  }

  record.reviewedBy = req.user._id;
  record.reviewedAt = new Date();
  record.reviewNotes = notes || (isApprove ? 'Approved by instructor after manual review' : 'Rejected due to anti-proxy violation');

  await record.save();

  // Send real-time notification to student regarding review resolution
  if (record.student?._id) {
    await sendNotification({
      recipientId: record.student._id,
      title: isApprove ? 'Attendance Verified' : 'Attendance Rejected (Proxy Flag)',
      message: isApprove
        ? `Your attendance for ${record.subject} has been reviewed and verified as valid.`
        : `Your attendance scan for ${record.subject} was rejected by instructor: ${record.reviewNotes}`,
      type: isApprove ? 'success' : 'error',
      eventType: 'ANTI_PROXY_REVIEW',
      data: { attendanceId: record._id, reviewStatus: record.reviewStatus }
    });
  }

  res.json({
    success: true,
    message: isApprove ? 'Attendance record approved successfully' : 'Attendance record rejected and marked Absent',
    data: record
  });
});

// @desc    Bulk approve or reject flagged attendance records
// @route   POST /api/anti-proxy/bulk-review
// @access  Private (Teacher/Admin)
const bulkReviewAttendanceRecords = asyncHandler(async (req, res) => {
  const { recordIds, action, notes } = req.body;

  if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of recordIds');
  }

  if (!action || !['approve', 'reject'].includes(action.toLowerCase())) {
    res.status(400);
    throw new Error("Action must be either 'approve' or 'reject'");
  }

  const isApprove = action.toLowerCase() === 'approve';
  const newReviewStatus = isApprove ? 'Approved' : 'Rejected';
  const reviewNotesText = notes || (isApprove ? 'Bulk approved by instructor' : 'Bulk rejected due to proxy violation');

  const updateFields = {
    reviewStatus: newReviewStatus,
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    reviewNotes: reviewNotesText
  };

  if (!isApprove) {
    updateFields.status = 'Absent';
  }

  await Attendance.updateMany({ _id: { $in: recordIds } }, { $set: updateFields });

  res.json({
    success: true,
    message: `Successfully updated ${recordIds.length} records to ${newReviewStatus}`,
    count: recordIds.length
  });
});

// @desc    Get Anti-Proxy Multi-Signal Analytics & Risk Breakdown
// @route   GET /api/anti-proxy/analytics
// @access  Private (Teacher/Admin)
const getAntiProxyAnalytics = asyncHandler(async (req, res) => {
  const allRecords = await Attendance.find({}).populate('student', 'name rollNo department');

  const totalScans = allRecords.length;
  const flaggedRecords = allRecords.filter((r) => r.riskLevel === 'Suspicious' || r.riskLevel === 'High Risk' || r.reviewStatus === 'Pending');

  const pendingCount = allRecords.filter((r) => r.reviewStatus === 'Pending').length;
  const approvedCount = allRecords.filter((r) => r.reviewStatus === 'Approved').length;
  const rejectedCount = allRecords.filter((r) => r.reviewStatus === 'Rejected').length;

  const normalCount = allRecords.filter((r) => r.riskLevel === 'Normal').length;
  const suspiciousCount = allRecords.filter((r) => r.riskLevel === 'Suspicious').length;
  const highRiskCount = allRecords.filter((r) => r.riskLevel === 'High Risk').length;

  // Signal Breakdown Counters
  const signalBreakdown = {
    'QR Token': 0,
    GPS: 0,
    Time: 0,
    Device: 0,
    IP: 0,
    Pattern: 0
  };

  allRecords.forEach((rec) => {
    if (rec.riskSignals && Array.isArray(rec.riskSignals)) {
      rec.riskSignals.forEach((sig) => {
        if (sig.status === 'FLAGGED' || sig.status === 'WARNING') {
          if (signalBreakdown[sig.signal] !== undefined) {
            signalBreakdown[sig.signal] += 1;
          }
        }
      });
    }
  });

  res.json({
    success: true,
    data: {
      totalScans,
      flaggedCount: flaggedRecords.length,
      pendingCount,
      approvedCount,
      rejectedCount,
      riskLevelDistribution: {
        normal: normalCount,
        suspicious: suspiciousCount,
        highRisk: highRiskCount
      },
      signalBreakdown,
      proxyPreventionRate: totalScans > 0 ? Number((((totalScans - highRiskCount) / totalScans) * 100).toFixed(1)) : 100
    }
  });
});

// @desc    Get Device Fingerprint & IP Multi-Account Clusters
// @route   GET /api/anti-proxy/device-clusters
// @access  Private (Teacher/Admin)
const getDeviceSharingClusters = asyncHandler(async (req, res) => {
  const allLogs = await Attendance.find({}).populate('student', 'name rollNo email department avatar');

  // Group by Device Fingerprint
  const fpMap = {};
  allLogs.forEach((log) => {
    const fp = log.deviceInfo?.deviceFingerprint || log.deviceInfo?.browserId;
    if (fp && fp.length > 3) {
      if (!fpMap[fp]) fpMap[fp] = [];
      fpMap[fp].push(log);
    }
  });

  const clusters = [];
  Object.keys(fpMap).forEach((fp) => {
    const logs = fpMap[fp];
    const studentMap = {};

    logs.forEach((l) => {
      if (l.student?._id) {
        const sId = l.student._id.toString();
        if (!studentMap[sId]) {
          studentMap[sId] = {
            student: l.student,
            scanCount: 0,
            lastScan: l.createdAt
          };
        }
        studentMap[sId].scanCount += 1;
      }
    });

    const studentList = Object.values(studentMap);
    if (studentList.length > 1) {
      clusters.push({
        deviceFingerprint: fp,
        uniqueStudentsCount: studentList.length,
        totalScansOnDevice: logs.length,
        students: studentList,
        latestIp: logs[0].deviceInfo?.ipAddress || '192.168.1.1',
        riskSeverity: studentList.length > 2 ? 'High Risk' : 'Suspicious'
      });
    }
  });

  clusters.sort((a, b) => b.uniqueStudentsCount - a.uniqueStudentsCount);

  res.json({
    success: true,
    count: clusters.length,
    data: clusters
  });
});

module.exports = {
  getFlaggedAttendanceRecords,
  reviewAttendanceRecord,
  bulkReviewAttendanceRecords,
  getAntiProxyAnalytics,
  getDeviceSharingClusters
};
