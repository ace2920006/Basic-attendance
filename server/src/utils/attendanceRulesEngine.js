const AttendanceRule = require('../models/AttendanceRule');

// Default fallback rules structure
const DEFAULT_RULES = {
  minAttendancePercentage: 75,
  lateThresholdMinutes: 10,
  gracePeriodMinutes: 5,
  qrValidityMinutes: 1,
  gpsRadiusMeters: 100,
  autoMarkAbsentMinutes: 30,
  allowStudentSelfCheckIn: true,
  consecutiveAbsentAlertThreshold: 3,
  statusConfigs: [
    { status: 'Present', label: 'Present', countsAsAttended: true, countsAsConducted: true, attendanceWeight: 1.0, badgeColor: '#10B981', description: 'On time attendance' },
    { status: 'Absent', label: 'Absent', countsAsAttended: false, countsAsConducted: true, attendanceWeight: 0.0, badgeColor: '#EF4444', description: 'Unexcused absence' },
    { status: 'Late', label: 'Late Arrival', countsAsAttended: true, countsAsConducted: true, attendanceWeight: 0.8, badgeColor: '#F59E0B', description: 'Arrived past grace period' },
    { status: 'Excused', label: 'Excused Absence', countsAsAttended: true, countsAsConducted: true, attendanceWeight: 1.0, badgeColor: '#8B5CF6', description: 'Approved official exception' },
    { status: 'On Leave', label: 'On Approved Leave', countsAsAttended: false, countsAsConducted: false, attendanceWeight: 0.0, badgeColor: '#3B82F6', description: 'Approved leave of absence' },
    { status: 'Holiday', label: 'Institutional Holiday', countsAsAttended: false, countsAsConducted: false, attendanceWeight: 0.0, badgeColor: '#6B7280', description: 'Scheduled holiday' },
    { status: 'Cancelled Lecture', label: 'Cancelled Lecture', countsAsAttended: false, countsAsConducted: false, attendanceWeight: 0.0, badgeColor: '#EC4899', description: 'Lecture cancelled' }
  ]
};

let cachedRules = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache TTL

/**
 * Get active attendance rules from DB or memory cache, creating defaults if empty.
 */
async function getSystemRules() {
  const now = Date.now();
  if (cachedRules && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedRules;
  }

  try {
    let rulesDoc = await AttendanceRule.findOne().sort({ createdAt: -1 });
    if (!rulesDoc) {
      rulesDoc = await AttendanceRule.create(DEFAULT_RULES);
    }
    cachedRules = rulesDoc.toObject ? rulesDoc.toObject() : rulesDoc;
    lastCacheTime = now;
    return cachedRules;
  } catch (err) {
    console.error('Error fetching system attendance rules, using defaults:', err.message);
    return DEFAULT_RULES;
  }
}

/**
 * Invalidate in-memory rules cache
 */
function invalidateRulesCache() {
  cachedRules = null;
  lastCacheTime = 0;
}

/**
 * Evaluate check-in parameters against active attendance rules.
 * Returns evaluated status, validity, delay in minutes, and human readable message.
 */
function evaluateCheckInStatus({ classStartTime, checkInTime, gpsDistance, qrTimestamp, rules }) {
  const r = rules || DEFAULT_RULES;
  const now = checkInTime ? new Date(checkInTime) : new Date();

  // 1. Verify QR validity if qrTimestamp provided
  let isQrValid = true;
  let qrAgeSeconds = 0;
  if (qrTimestamp) {
    const qrTime = new Date(qrTimestamp).getTime();
    qrAgeSeconds = Math.max(0, Math.floor((now.getTime() - qrTime) / 1000));
    const maxQrSeconds = (r.qrValidityMinutes || 1) * 60;
    if (qrAgeSeconds > maxQrSeconds) {
      isQrValid = false;
    }
  }

  // 2. Verify GPS bounds if gpsDistance provided
  let isGpsValid = true;
  const distance = typeof gpsDistance === 'number' ? gpsDistance : 0;
  const maxGpsRadius = r.gpsRadiusMeters || 100;
  if (typeof gpsDistance === 'number' && gpsDistance > maxGpsRadius) {
    isGpsValid = false;
  }

  // 3. Evaluate arrival delay relative to classStartTime or QR timestamp
  const startTime = classStartTime ? new Date(classStartTime).getTime() : now.getTime();
  const delayMinutes = Math.max(0, Math.floor((now.getTime() - startTime) / (60 * 1000)));

  const gracePeriod = r.gracePeriodMinutes ?? 5;
  const lateCutoff = r.lateThresholdMinutes ?? 10;

  let calculatedStatus = 'Present';
  let message = 'Check-in verified: Present';

  if (!isQrValid) {
    return {
      isValid: false,
      status: 'Absent',
      errorCode: 'EXPIRED_QR',
      message: `QR code expired (${qrAgeSeconds}s old, limit ${r.qrValidityMinutes * 60}s). Please scan a fresh QR code.`,
      delayMinutes,
      distanceMeters: distance
    };
  }

  if (!isGpsValid) {
    return {
      isValid: false,
      status: 'Absent',
      errorCode: 'OUT_OF_BOUNDS',
      message: `GPS location out of bounds (${Math.round(distance)}m from classroom, allowed radius ${maxGpsRadius}m).`,
      delayMinutes,
      distanceMeters: distance
    };
  }

  if (delayMinutes > lateCutoff) {
    calculatedStatus = 'Absent';
    message = `Check-in delayed by ${delayMinutes} mins (exceeded late threshold of ${lateCutoff} mins). Marked Absent.`;
  } else if (delayMinutes > gracePeriod) {
    calculatedStatus = 'Late';
    message = `Check-in delayed by ${delayMinutes} mins (grace period was ${gracePeriod} mins). Marked Late.`;
  } else {
    calculatedStatus = 'Present';
    message = `Check-in on time (${delayMinutes} mins delay). Marked Present.`;
  }

  return {
    isValid: true,
    status: calculatedStatus,
    message,
    delayMinutes,
    distanceMeters: distance,
    isWithinGracePeriod: delayMinutes <= gracePeriod,
    isWithinLateThreshold: delayMinutes <= lateCutoff
  };
}

/**
 * Calculate attendance metrics for a student using dynamic status configs.
 */
function calculateAttendanceStats(records = [], rules = DEFAULT_RULES) {
  const configsMap = new Map();
  (rules.statusConfigs || DEFAULT_RULES.statusConfigs).forEach((cfg) => {
    configsMap.set(cfg.status, cfg);
  });

  let totalConducted = 0;
  let totalAttended = 0;
  let weightedScore = 0;

  const statusBreakdown = {
    Present: 0,
    Absent: 0,
    Late: 0,
    Excused: 0,
    'On Leave': 0,
    Holiday: 0,
    'Cancelled Lecture': 0
  };

  records.forEach((rec) => {
    const st = rec.status || 'Present';
    statusBreakdown[st] = (statusBreakdown[st] || 0) + 1;

    const cfg = configsMap.get(st) || {
      countsAsAttended: st === 'Present' || st === 'Late',
      countsAsConducted: st !== 'Holiday' && st !== 'Cancelled Lecture' && st !== 'On Leave',
      attendanceWeight: st === 'Late' ? 0.8 : st === 'Present' ? 1.0 : 0.0
    };

    if (cfg.countsAsConducted) {
      totalConducted++;
    }

    if (cfg.countsAsAttended) {
      totalAttended++;
      weightedScore += cfg.attendanceWeight !== undefined ? cfg.attendanceWeight : 1.0;
    }
  });

  const rawPercentage = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;
  const weightedPercentage = totalConducted > 0 ? (weightedScore / totalConducted) * 100 : 100;

  const minRequired = rules.minAttendancePercentage || 75;
  const isEligible = weightedPercentage >= minRequired;

  return {
    totalRecords: records.length,
    totalConducted,
    totalAttended,
    weightedScore: Number(weightedScore.toFixed(2)),
    rawPercentage: Number(rawPercentage.toFixed(1)),
    weightedPercentage: Number(weightedPercentage.toFixed(1)),
    minRequiredPercentage: minRequired,
    isEligible,
    isShortage: !isEligible,
    statusBreakdown
  };
}

module.exports = {
  DEFAULT_RULES,
  getSystemRules,
  invalidateRulesCache,
  evaluateCheckInStatus,
  calculateAttendanceStats
};
