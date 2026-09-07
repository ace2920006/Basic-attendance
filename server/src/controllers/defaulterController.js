const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const AttendanceRule = require('../models/AttendanceRule');
const DefaulterRecord = require('../models/DefaulterRecord');
const { recordAuditLog, AUDIT_ACTIONS } = require('../middleware/auditMiddleware');
const { getSystemRules, invalidateRulesCache } = require('../utils/attendanceRulesEngine');
const {
  DEFAULT_DEFAULTER_THRESHOLDS,
  getDefaulterConfig,
  classifyDefaulterTier,
  calculateClassesNeeded,
  evaluateStudentDefaulter,
  evaluateAllDefaulters
} = require('../services/defaulterService');
const { notifyDefaulterEscalation } = require('../services/notificationService');

// @desc    Get active and historical defaulters with filtering & search
// @route   GET /api/defaulters
// @access  Private (Teacher/Admin)
const getDefaulters = asyncHandler(async (req, res) => {
  const {
    tier,
    department,
    division,
    status = 'active',
    search,
    page = 1,
    limit = 50,
    sortBy = 'attendancePercentage',
    sortOrder = 'asc'
  } = req.query;

  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (tier && tier !== 'all') {
    query.tier = tier.toUpperCase();
  }

  if (department && department !== 'all') {
    query.department = department;
  }

  if (division && division !== 'all') {
    query.division = division;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { studentName: searchRegex },
      { studentRollNo: searchRegex },
      { studentEmail: searchRegex }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  const sortObj = {};
  sortObj[sortBy] = sortDirection;

  const total = await DefaulterRecord.countDocuments(query);
  const records = await DefaulterRecord.find(query)
    .populate('student', 'name email rollNo department avatar guardianName guardianEmail guardianPhone')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  // Fetch summary counts
  const summaryAgg = await DefaulterRecord.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$tier',
        count: { $sum: 1 }
      }
    }
  ]);

  const byTier = {
    WARNING: 0,
    SERIOUS_WARNING: 0,
    ADMIN_ALERT: 0,
    PARENT_ALERT: 0
  };

  summaryAgg.forEach((item) => {
    if (byTier[item._id] !== undefined) {
      byTier[item._id] = item.count;
    }
  });

  const totalActive = Object.values(byTier).reduce((a, b) => a + b, 0);

  res.json({
    success: true,
    count: records.length,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
    currentPage: pageNum,
    summary: {
      totalActiveDefaulters: totalActive,
      byTier,
      warningCount: byTier.WARNING,
      seriousCount: byTier.SERIOUS_WARNING,
      adminAlertCount: byTier.ADMIN_ALERT,
      parentAlertCount: byTier.PARENT_ALERT
    },
    data: records
  });
});

// @desc    Get defaulter executive KPI summary and metrics
// @route   GET /api/defaulters/summary
// @access  Private (Teacher/Admin)
const getDefaulterSummary = asyncHandler(async (req, res) => {
  const rules = await getSystemRules();
  const config = getDefaulterConfig(rules);

  const activeDefaulters = await DefaulterRecord.find({ status: 'active' });
  const resolvedCount = await DefaulterRecord.countDocuments({ status: 'resolved' });
  const parentAlertedCount = await DefaulterRecord.countDocuments({
    status: 'active',
    parentNotified: true
  });

  const byTier = {
    WARNING: 0,
    SERIOUS_WARNING: 0,
    ADMIN_ALERT: 0,
    PARENT_ALERT: 0
  };

  let totalDeficitClasses = 0;

  activeDefaulters.forEach((rec) => {
    if (byTier[rec.tier] !== undefined) {
      byTier[rec.tier]++;
    }
    totalDeficitClasses += rec.classesNeededToTarget || 0;
  });

  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalActive = activeDefaulters.length;
  const defaulterPercentage = totalStudents > 0 ? Number(((totalActive / totalStudents) * 100).toFixed(1)) : 0;

  res.json({
    success: true,
    data: {
      totalStudents,
      totalActiveDefaulters: totalActive,
      defaulterPercentage,
      totalDeficitClasses,
      resolvedCount,
      parentAlertedCount,
      byTier: {
        warning: {
          count: byTier.WARNING,
          threshold: config.warningThreshold,
          label: `Warning (<${config.warningThreshold}%)`
        },
        seriousWarning: {
          count: byTier.SERIOUS_WARNING,
          threshold: config.seriousWarningThreshold,
          label: `Serious Warning (<${config.seriousWarningThreshold}%)`
        },
        adminAlert: {
          count: byTier.ADMIN_ALERT,
          threshold: config.adminAlertThreshold,
          label: `Admin Alert (<${config.adminAlertThreshold}%)`
        },
        parentAlert: {
          count: byTier.PARENT_ALERT,
          threshold: config.parentAlertThreshold,
          label: `Parent Alert (<${config.parentAlertThreshold}%)`
        }
      },
      config
    }
  });
});

// @desc    Get active configurable defaulter thresholds and escalation settings
// @route   GET /api/defaulters/config
// @access  Private
const getDefaulterConfiguration = asyncHandler(async (req, res) => {
  const rules = await getSystemRules();
  const config = getDefaulterConfig(rules);

  res.json({
    success: true,
    data: config
  });
});

// @desc    Update configurable defaulter thresholds and escalation policies
// @route   PUT /api/defaulters/config
// @access  Private (Admin)
const updateDefaulterConfiguration = asyncHandler(async (req, res) => {
  const {
    warningThreshold,
    seriousWarningThreshold,
    adminAlertThreshold,
    parentAlertThreshold,
    minClassesBeforeEvaluation,
    autoEscalateOnMark,
    sendStudentNotification,
    sendAdminAlert,
    sendParentEmail,
    enabled
  } = req.body;

  let rulesDoc = await AttendanceRule.findOne().sort({ createdAt: -1 });
  if (!rulesDoc) {
    rulesDoc = new AttendanceRule();
  }

  if (!rulesDoc.defaulterConfig) {
    rulesDoc.defaulterConfig = { ...DEFAULT_DEFAULTER_THRESHOLDS };
  }

  // Validate threshold sanity
  const wTh = warningThreshold !== undefined ? Number(warningThreshold) : rulesDoc.defaulterConfig.warningThreshold;
  const sTh = seriousWarningThreshold !== undefined ? Number(seriousWarningThreshold) : rulesDoc.defaulterConfig.seriousWarningThreshold;
  const aTh = adminAlertThreshold !== undefined ? Number(adminAlertThreshold) : rulesDoc.defaulterConfig.adminAlertThreshold;
  const pTh = parentAlertThreshold !== undefined ? Number(parentAlertThreshold) : rulesDoc.defaulterConfig.parentAlertThreshold;

  if (wTh < 1 || wTh > 100 || sTh < 1 || sTh > 100 || aTh < 1 || aTh > 100 || pTh < 1 || pTh > 100) {
    res.status(400);
    throw new Error('All attendance thresholds must be between 1% and 100%');
  }

  if (wTh < sTh || sTh < aTh || aTh < pTh) {
    res.status(400);
    throw new Error(
      'Threshold escalation hierarchy violation: Warning Threshold must be >= Serious Warning >= Admin Alert >= Parent Alert'
    );
  }

  rulesDoc.defaulterConfig.warningThreshold = wTh;
  rulesDoc.defaulterConfig.seriousWarningThreshold = sTh;
  rulesDoc.defaulterConfig.adminAlertThreshold = aTh;
  rulesDoc.defaulterConfig.parentAlertThreshold = pTh;

  // Also sync primary minAttendancePercentage with the Warning Threshold
  rulesDoc.minAttendancePercentage = wTh;

  if (minClassesBeforeEvaluation !== undefined) {
    rulesDoc.defaulterConfig.minClassesBeforeEvaluation = Math.max(1, Number(minClassesBeforeEvaluation));
  }
  if (autoEscalateOnMark !== undefined) {
    rulesDoc.defaulterConfig.autoEscalateOnMark = Boolean(autoEscalateOnMark);
  }
  if (sendStudentNotification !== undefined) {
    rulesDoc.defaulterConfig.sendStudentNotification = Boolean(sendStudentNotification);
  }
  if (sendAdminAlert !== undefined) {
    rulesDoc.defaulterConfig.sendAdminAlert = Boolean(sendAdminAlert);
  }
  if (sendParentEmail !== undefined) {
    rulesDoc.defaulterConfig.sendParentEmail = Boolean(sendParentEmail);
  }
  if (enabled !== undefined) {
    rulesDoc.defaulterConfig.enabled = Boolean(enabled);
  }

  rulesDoc.updatedBy = req.user._id;
  await rulesDoc.save();

  // Invalidate in-memory rules cache
  invalidateRulesCache();

  await recordAuditLog({
    req,
    user: req.user,
    action: AUDIT_ACTIONS.CHANGE_SETTINGS,
    resource: 'Defaulter Management Rules',
    reason: 'Admin updated defaulter escalation thresholds and automated policies',
    status: 'SUCCESS',
    details: {
      warningThreshold: wTh,
      seriousWarningThreshold: sTh,
      adminAlertThreshold: aTh,
      parentAlertThreshold: pTh,
      autoEscalateOnMark: rulesDoc.defaulterConfig.autoEscalateOnMark,
      sendParentEmail: rulesDoc.defaulterConfig.sendParentEmail,
      updatedBy: req.user.name
    }
  });

  res.json({
    success: true,
    message: 'Defaulter thresholds and escalation policies updated successfully',
    data: rulesDoc.defaulterConfig
  });
});

// @desc    Trigger automated batch scan and evaluation across students
// @route   POST /api/defaulters/evaluate
// @access  Private (Teacher/Admin)
const evaluateDefaultersBatch = asyncHandler(async (req, res) => {
  const { department, division, forceNotify = false } = req.body;

  const filters = {};
  if (department && department !== 'all') filters.department = department;
  if (division && division !== 'all') filters.division = division;

  const results = await evaluateAllDefaulters(filters, { forceNotify: Boolean(forceNotify) });

  await recordAuditLog({
    req,
    user: req.user,
    action: AUDIT_ACTIONS.SECURITY_SCAN,
    resource: 'Defaulter Evaluation Engine',
    reason: `Automated defaulter scan executed by ${req.user.name}`,
    status: 'SUCCESS',
    details: {
      filters,
      scanned: results.evaluatedCount,
      defaultersDetected: results.defaultersCount,
      notificationsDispatched: results.notificationsSent
    }
  });

  res.json({
    success: true,
    message: `Evaluated ${results.evaluatedCount} students. Found ${results.defaultersCount} defaulters.`,
    data: results
  });
});

// @desc    Manually escalate student tier or dispatch immediate notification
// @route   POST /api/defaulters/:id/escalate
// @access  Private (Admin/Teacher)
const escalateDefaulter = asyncHandler(async (req, res) => {
  const { targetTier, actionNotes, notifyParent = false } = req.body;

  const record = await DefaulterRecord.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Defaulter record not found');
  }

  const student = await User.findById(record.student);
  if (!student) {
    res.status(404);
    throw new Error('Associated student user not found');
  }

  const rules = await getSystemRules();
  const config = getDefaulterConfig(rules);

  const escalationTier = targetTier || record.tier;
  record.tier = escalationTier;

  const actionMsg = actionNotes || `Manual escalation to ${escalationTier} triggered by ${req.user.name}`;

  // Dispatch notifications
  await notifyDefaulterEscalation({
    student,
    defaulterRecord: record,
    tier: escalationTier,
    config: {
      ...config,
      sendParentEmail: notifyParent || config.sendParentEmail
    }
  });

  if (escalationTier === 'PARENT_ALERT' || notifyParent) {
    record.parentNotified = true;
    record.parentNotifiedAt = new Date();
  }

  record.escalationHistory.push({
    tier: escalationTier,
    triggeredAt: new Date(),
    actionSummary: actionMsg,
    channels: ['in_app', 'email', 'push'],
    recipients: [student.email, notifyParent ? student.guardianEmail : null].filter(Boolean),
    status: 'MANUAL_ESCALATION'
  });

  await record.save();

  await recordAuditLog({
    req,
    user: req.user,
    targetUser: student._id,
    targetUserName: student.name,
    targetUserRollNo: student.rollNo,
    action: AUDIT_ACTIONS.UPDATE_USER,
    resource: 'Defaulter Record',
    reason: actionMsg,
    status: 'SUCCESS',
    details: {
      defaulterId: record._id,
      tier: escalationTier,
      notifyParent
    }
  });

  res.json({
    success: true,
    message: `Defaulter escalated successfully to ${escalationTier}`,
    data: record
  });
});

// @desc    Mark a defaulter record as resolved with counselor notes
// @route   POST /api/defaulters/:id/resolve
// @access  Private (Admin)
const resolveDefaulter = asyncHandler(async (req, res) => {
  const { notes = 'Defaulter status manually resolved by administration' } = req.body;

  const record = await DefaulterRecord.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Defaulter record not found');
  }

  record.status = 'resolved';
  record.resolvedAt = new Date();
  record.resolvedBy = req.user._id;
  record.resolutionNotes = notes;

  record.escalationHistory.push({
    tier: record.tier,
    triggeredAt: new Date(),
    actionSummary: `Defaulter cleared by ${req.user.name}: ${notes}`,
    channels: ['in_app'],
    recipients: [record.studentEmail],
    status: 'MANUALLY_RESOLVED'
  });

  await record.save();

  // Reset student account warning flag if no other active defaulter records
  const remainingActive = await DefaulterRecord.countDocuments({
    student: record.student,
    status: 'active'
  });

  if (remainingActive === 0) {
    await User.findByIdAndUpdate(record.student, { status: 'Active' });
  }

  res.json({
    success: true,
    message: 'Defaulter marked as resolved',
    data: record
  });
});

// @desc    Bulk dispatch notifications to active defaulters
// @route   POST /api/defaulters/notify-bulk
// @access  Private (Admin)
const bulkNotifyDefaulters = asyncHandler(async (req, res) => {
  const { tier, department, studentIds } = req.body;

  const query = { status: 'active' };
  if (tier && tier !== 'all') query.tier = tier;
  if (department && department !== 'all') query.department = department;
  if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
    query.student = { $in: studentIds };
  }

  const activeRecords = await DefaulterRecord.find(query);
  const rules = await getSystemRules();
  const config = getDefaulterConfig(rules);

  let notifiedCount = 0;
  let parentNotifiedCount = 0;

  for (const rec of activeRecords) {
    const student = await User.findById(rec.student);
    if (!student) continue;

    await notifyDefaulterEscalation({
      student,
      defaulterRecord: rec,
      tier: rec.tier,
      config
    });

    notifiedCount++;
    if (rec.tier === 'PARENT_ALERT' && student.guardianEmail) {
      parentNotifiedCount++;
      rec.parentNotified = true;
      rec.parentNotifiedAt = new Date();
    }

    rec.escalationHistory.push({
      tier: rec.tier,
      triggeredAt: new Date(),
      actionSummary: `Bulk notice dispatched by ${req.user.name}`,
      channels: ['in_app', 'email', 'push'],
      recipients: [student.email, rec.tier === 'PARENT_ALERT' ? student.guardianEmail : null].filter(Boolean),
      status: 'BULK_DISPATCH'
    });

    await rec.save();
  }

  res.json({
    success: true,
    message: `Dispatched notices to ${notifiedCount} students (${parentNotifiedCount} parent emails).`,
    notifiedCount,
    parentNotifiedCount
  });
});

// @desc    Get individual student defaulter status and history
// @route   GET /api/defaulters/student/:studentId
// @access  Private (Student/Teacher/Admin)
const getStudentDefaulterStatus = asyncHandler(async (req, res) => {
  const targetId = req.params.studentId || req.user._id;

  // Student can only view their own defaulter status
  if (req.user.role === 'student' && targetId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access other students defaulter status');
  }

  const activeRecord = await DefaulterRecord.findOne({
    student: targetId,
    status: 'active'
  });

  const history = await DefaulterRecord.find({ student: targetId }).sort({ createdAt: -1 });
  const rules = await getSystemRules();
  const config = getDefaulterConfig(rules);

  res.json({
    success: true,
    data: {
      isDefaulter: !!activeRecord,
      currentRecord: activeRecord,
      history,
      activeThresholds: {
        warning: config.warningThreshold,
        seriousWarning: config.seriousWarningThreshold,
        adminAlert: config.adminAlertThreshold,
        parentAlert: config.parentAlertThreshold
      }
    }
  });
});

module.exports = {
  getDefaulters,
  getDefaulterSummary,
  getDefaulterConfiguration,
  updateDefaulterConfiguration,
  evaluateDefaultersBatch,
  escalateDefaulter,
  resolveDefaulter,
  bulkNotifyDefaulters,
  getStudentDefaulterStatus
};
