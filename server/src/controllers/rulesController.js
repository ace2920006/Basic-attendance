const asyncHandler = require('../utils/asyncHandler');
const AttendanceRule = require('../models/AttendanceRule');
const { recordAuditLog, AUDIT_ACTIONS } = require('../middleware/auditMiddleware');
const {
  DEFAULT_RULES,
  getSystemRules,
  invalidateRulesCache,
  evaluateCheckInStatus
} = require('../utils/attendanceRulesEngine');

// @desc    Get active attendance rules & status definitions
// @route   GET /api/attendance-rules
// @access  Private
const getRules = asyncHandler(async (req, res) => {
  const rules = await getSystemRules();
  res.json({
    success: true,
    data: rules
  });
});

// @desc    Update attendance rules & status configurations
// @route   PUT /api/attendance-rules
// @access  Private (Admin)
const updateRules = asyncHandler(async (req, res) => {
  const {
    minAttendancePercentage,
    lateThresholdMinutes,
    gracePeriodMinutes,
    qrValidityMinutes,
    gpsRadiusMeters,
    autoMarkAbsentMinutes,
    allowStudentSelfCheckIn,
    consecutiveAbsentAlertThreshold,
    statusConfigs
  } = req.body;

  let rulesDoc = await AttendanceRule.findOne().sort({ createdAt: -1 });

  if (!rulesDoc) {
    rulesDoc = new AttendanceRule(DEFAULT_RULES);
  }

  if (minAttendancePercentage !== undefined) rulesDoc.minAttendancePercentage = Number(minAttendancePercentage);
  if (lateThresholdMinutes !== undefined) rulesDoc.lateThresholdMinutes = Number(lateThresholdMinutes);
  if (gracePeriodMinutes !== undefined) rulesDoc.gracePeriodMinutes = Number(gracePeriodMinutes);
  if (qrValidityMinutes !== undefined) rulesDoc.qrValidityMinutes = Number(qrValidityMinutes);
  if (gpsRadiusMeters !== undefined) rulesDoc.gpsRadiusMeters = Number(gpsRadiusMeters);
  if (autoMarkAbsentMinutes !== undefined) rulesDoc.autoMarkAbsentMinutes = Number(autoMarkAbsentMinutes);
  if (allowStudentSelfCheckIn !== undefined) rulesDoc.allowStudentSelfCheckIn = Boolean(allowStudentSelfCheckIn);
  if (consecutiveAbsentAlertThreshold !== undefined) rulesDoc.consecutiveAbsentAlertThreshold = Number(consecutiveAbsentAlertThreshold);

  if (statusConfigs && Array.isArray(statusConfigs)) {
    rulesDoc.statusConfigs = statusConfigs;
  }

  rulesDoc.updatedBy = req.user._id;
  await rulesDoc.save();

  // Invalidate in-memory cache
  invalidateRulesCache();

  recordAuditLog({
    req,
    user: req.user,
    action: AUDIT_ACTIONS.CHANGE_SETTINGS,
    resource: 'Attendance Rules',
    reason: 'Admin updated attendance thresholds and status matrix',
    status: 'SUCCESS',
    details: {
      settingType: 'Attendance Rules & Thresholds',
      minAttendancePercentage: rulesDoc.minAttendancePercentage,
      lateThresholdMinutes: rulesDoc.lateThresholdMinutes,
      gracePeriodMinutes: rulesDoc.gracePeriodMinutes,
      qrValidityMinutes: rulesDoc.qrValidityMinutes,
      gpsRadiusMeters: rulesDoc.gpsRadiusMeters,
      changedBy: req.user?._id,
      changedByName: req.user?.name
    }
  });

  res.json({
    success: true,
    message: 'Attendance rules & status matrix updated successfully',
    data: rulesDoc
  });
});

// @desc    Reset attendance rules to factory default configuration
// @route   POST /api/attendance-rules/reset
// @access  Private (Admin)
const resetRules = asyncHandler(async (req, res) => {
  await AttendanceRule.deleteMany({});
  const defaultDoc = await AttendanceRule.create({
    ...DEFAULT_RULES,
    updatedBy: req.user._id
  });

  // Invalidate in-memory cache
  invalidateRulesCache();

  recordAuditLog({
    req,
    user: req.user,
    action: AUDIT_ACTIONS.CHANGE_SETTINGS,
    resource: 'Attendance Rules',
    reason: 'Admin reset attendance rules to factory defaults',
    status: 'SUCCESS',
    details: {
      settingType: 'Attendance Rules Factory Reset',
      changedBy: req.user?._id,
      changedByName: req.user?.name
    }
  });

  res.json({
    success: true,
    message: 'Attendance rules reset to factory defaults',
    data: defaultDoc
  });
});

// @desc    Interactive Rule Simulator / Sandbox test endpoint
// @route   POST /api/attendance-rules/evaluate
// @access  Private
const evaluateSandbox = asyncHandler(async (req, res) => {
  const { classStartTime, checkInTime, gpsDistance, qrTimestamp } = req.body;
  const rules = await getSystemRules();

  const evaluationResult = evaluateCheckInStatus({
    classStartTime,
    checkInTime,
    gpsDistance: typeof gpsDistance === 'number' ? gpsDistance : undefined,
    qrTimestamp,
    rules
  });

  res.json({
    success: true,
    data: {
      evaluationResult,
      activeRules: {
        minAttendancePercentage: rules.minAttendancePercentage,
        lateThresholdMinutes: rules.lateThresholdMinutes,
        gracePeriodMinutes: rules.gracePeriodMinutes,
        qrValidityMinutes: rules.qrValidityMinutes,
        gpsRadiusMeters: rules.gpsRadiusMeters
      }
    }
  });
});

module.exports = {
  getRules,
  updateRules,
  resetRules,
  evaluateSandbox
};
