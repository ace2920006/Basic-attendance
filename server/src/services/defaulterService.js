const User = require('../models/User');
const Attendance = require('../models/Attendance');
const DefaulterRecord = require('../models/DefaulterRecord');
const { getSystemRules, calculateAttendanceStats } = require('../utils/attendanceRulesEngine');
const { notifyDefaulterEscalation } = require('./notificationService');

const DEFAULT_DEFAULTER_THRESHOLDS = {
  enabled: true,
  warningThreshold: 75,
  seriousWarningThreshold: 70,
  adminAlertThreshold: 65,
  parentAlertThreshold: 60,
  minClassesBeforeEvaluation: 3,
  autoEscalateOnMark: true,
  sendStudentNotification: true,
  sendAdminAlert: true,
  sendParentEmail: true
};

/**
 * Extract active defaulter configuration from system rules
 */
function getDefaulterConfig(rules) {
  if (!rules || !rules.defaulterConfig) {
    return { ...DEFAULT_DEFAULTER_THRESHOLDS };
  }
  return {
    ...DEFAULT_DEFAULTER_THRESHOLDS,
    ...rules.defaulterConfig
  };
}

/**
 * Classify student attendance percentage into configured escalation tiers
 *
 * Hierarchy:
 * >= Warning Threshold (default 75%)        -> Safe / Normal
 * < Warning Threshold (default 75%)         -> Warning
 * < Serious Warning Threshold (default 70%) -> Serious Warning
 * < Admin Alert Threshold (default 65%)     -> Admin Alert
 * < Parent Alert Threshold (default 60%)    -> Parent/Guardian Alert
 */
function classifyDefaulterTier(percentage, config = DEFAULT_DEFAULTER_THRESHOLDS) {
  const warningTh = Number(config.warningThreshold ?? 75);
  const seriousTh = Number(config.seriousWarningThreshold ?? 70);
  const adminTh = Number(config.adminAlertThreshold ?? 65);
  const parentTh = Number(config.parentAlertThreshold ?? 60);

  const pct = Number(percentage);

  if (pct >= warningTh) {
    return {
      isDefaulter: false,
      tier: null,
      tierLabel: 'Safe (>= ' + warningTh + '%)',
      color: 'emerald',
      severity: 0,
      action: 'None',
      description: 'Attendance meets or exceeds institutional requirement'
    };
  }

  // < 60% Parent/Guardian Alert
  if (pct < parentTh) {
    return {
      isDefaulter: true,
      tier: 'PARENT_ALERT',
      tierLabel: `Parent Alert (<${parentTh}%)`,
      color: 'crimson',
      severity: 4,
      action: 'Parent & Admin Alert Dispatched',
      description: 'Emergency attendance deficit triggering direct parental contact & counseling'
    };
  }

  // < 65% Admin Alert
  if (pct < adminTh) {
    return {
      isDefaulter: true,
      tier: 'ADMIN_ALERT',
      tierLabel: `Admin Alert (<${adminTh}%)`,
      color: 'rose',
      severity: 3,
      action: 'Administration & HOD Alert Dispatched',
      description: 'Critical attendance shortage flagged on Administration Defaulter Roster'
    };
  }

  // < 70% Serious Warning
  if (pct < seriousTh) {
    return {
      isDefaulter: true,
      tier: 'SERIOUS_WARNING',
      tierLabel: `Serious Warning (<${seriousTh}%)`,
      color: 'orange',
      severity: 2,
      action: 'Urgent Mentor Meeting Notice',
      description: 'Serious attendance deficit requiring immediate faculty mentor intervention'
    };
  }

  // < 75% Warning
  return {
    isDefaulter: true,
    tier: 'WARNING',
    tierLabel: `Warning (<${warningTh}%)`,
    color: 'amber',
    severity: 1,
    action: 'Student Shortage Notice',
    description: 'Attendance below institutional minimum requirement'
  };
}

/**
 * Calculate recovery classes needed to reach target percentage:
 * Formula: x = ceil((r*T - P) / (1 - r))
 */
function calculateClassesNeeded(attended, total, targetPercentage = 75) {
  if (!total || total <= 0) return 0;
  const currentRate = (attended / total) * 100;
  if (currentRate >= targetPercentage) return 0;

  const r = Math.min(0.99, targetPercentage / 100);
  const required = Math.ceil((r * total - attended) / (1 - r));
  return Math.max(1, required);
}

/**
 * Automatically evaluate a single student against active defaulter rules
 */
async function evaluateStudentDefaulter(studentId, { forceNotify = false, rulesOverride = null } = {}) {
  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return { evaluated: false, reason: 'user_not_found_or_not_student' };
    }

    const rules = rulesOverride || (await getSystemRules());
    const config = getDefaulterConfig(rules);

    // Fetch attendance records for this student
    const records = await Attendance.find({ student: studentId });

    if (records.length < (config.minClassesBeforeEvaluation || 3) && !forceNotify) {
      return {
        evaluated: false,
        reason: 'insufficient_classes',
        recordsCount: records.length,
        minRequired: config.minClassesBeforeEvaluation || 3
      };
    }

    const stats = calculateAttendanceStats(records, rules);
    const tierInfo = classifyDefaulterTier(stats.weightedPercentage, config);

    // If attendance is now SAFE (>= warningThreshold)
    if (!tierInfo.isDefaulter) {
      const activeRecord = await DefaulterRecord.findOne({
        student: studentId,
        status: 'active'
      });

      if (activeRecord) {
        activeRecord.status = 'resolved';
        activeRecord.attendancePercentage = stats.weightedPercentage;
        activeRecord.attendedClasses = stats.totalAttended;
        activeRecord.totalClasses = stats.totalConducted;
        activeRecord.classesNeededToTarget = 0;
        activeRecord.resolvedAt = new Date();
        activeRecord.resolutionNotes = `Attendance recovered to ${stats.weightedPercentage}% (above ${config.warningThreshold}% requirement).`;
        activeRecord.escalationHistory.push({
          tier: activeRecord.tier,
          triggeredAt: new Date(),
          actionSummary: `Defaulter cleared: attendance recovered to ${stats.weightedPercentage}%`,
          channels: ['in_app'],
          recipients: [student.email],
          status: 'RESOLVED'
        });
        await activeRecord.save();

        // Reset student status if was in Warning
        if (student.status === 'Warning') {
          student.status = 'Active';
          await student.save();
        }
      }

      return {
        evaluated: true,
        isDefaulter: false,
        studentId,
        studentName: student.name,
        attendancePercentage: stats.weightedPercentage,
        tier: null,
        previousRecordResolved: !!activeRecord
      };
    }

    // Student IS a defaulter
    const classesNeeded = calculateClassesNeeded(
      stats.totalAttended,
      stats.totalConducted,
      config.warningThreshold
    );

    let record = await DefaulterRecord.findOne({
      student: studentId,
      status: 'active'
    });

    const isNew = !record;
    const previousTier = record ? record.tier : null;
    const tierChanged = previousTier !== tierInfo.tier;

    if (!record) {
      record = new DefaulterRecord({
        student: studentId,
        studentName: student.name,
        studentRollNo: student.rollNo || '',
        studentEmail: student.email || '',
        department: student.department || 'General',
        division: student.divisionName || '',
        course: student.course || '',
        semester: student.semester || '',
        guardianName: student.guardianName || '',
        guardianEmail: student.guardianEmail || '',
        guardianPhone: student.guardianPhone || '',
        attendancePercentage: stats.weightedPercentage,
        attendedClasses: stats.totalAttended,
        totalClasses: stats.totalConducted,
        classesNeededToTarget: classesNeeded,
        targetPercentage: config.warningThreshold,
        tier: tierInfo.tier,
        tierLabel: tierInfo.tierLabel,
        status: 'active',
        escalationHistory: []
      });
    } else {
      record.studentName = student.name;
      record.studentRollNo = student.rollNo || record.studentRollNo;
      record.studentEmail = student.email || record.studentEmail;
      record.department = student.department || record.department;
      record.division = student.divisionName || record.division;
      record.course = student.course || record.course;
      record.semester = student.semester || record.semester;
      record.guardianName = student.guardianName || record.guardianName;
      record.guardianEmail = student.guardianEmail || record.guardianEmail;
      record.guardianPhone = student.guardianPhone || record.guardianPhone;
      record.attendancePercentage = stats.weightedPercentage;
      record.attendedClasses = stats.totalAttended;
      record.totalClasses = stats.totalConducted;
      record.classesNeededToTarget = classesNeeded;
      record.targetPercentage = config.warningThreshold;
      record.tier = tierInfo.tier;
      record.tierLabel = tierInfo.tierLabel;
      record.lastEvaluatedAt = new Date();
    }

    // Flag user status to Warning
    if (student.status !== 'Warning') {
      student.status = 'Warning';
      await student.save();
    }

    // Send notifications if enabled and either fresh, escalated, or forced
    let notificationDispatched = false;
    if (config.enabled !== false && (isNew || tierChanged || forceNotify)) {
      await notifyDefaulterEscalation({
        student,
        defaulterRecord: record,
        tier: tierInfo.tier,
        config
      });

      notificationDispatched = true;

      if (tierInfo.tier === 'WARNING') {
        record.warningNotified = true;
        record.warningNotifiedAt = new Date();
      } else if (tierInfo.tier === 'SERIOUS_WARNING') {
        record.seriousNotified = true;
        record.seriousNotifiedAt = new Date();
      } else if (tierInfo.tier === 'ADMIN_ALERT') {
        record.adminNotified = true;
        record.adminNotifiedAt = new Date();
      } else if (tierInfo.tier === 'PARENT_ALERT') {
        record.parentNotified = true;
        record.parentNotifiedAt = new Date();
        record.adminNotified = true;
        record.adminNotifiedAt = new Date();
      }

      record.escalationHistory.push({
        tier: tierInfo.tier,
        triggeredAt: new Date(),
        actionSummary: `${tierInfo.action} triggered at ${stats.weightedPercentage}% cumulative attendance (Deficit: ${classesNeeded} classes needed)`,
        channels: ['in_app', 'email', 'push'],
        recipients: [
          student.email,
          tierInfo.tier === 'PARENT_ALERT' && student.guardianEmail ? student.guardianEmail : null
        ].filter(Boolean),
        status: 'DISPATCHED'
      });
    }

    await record.save();

    return {
      evaluated: true,
      isDefaulter: true,
      studentId,
      studentName: student.name,
      attendancePercentage: stats.weightedPercentage,
      tier: tierInfo.tier,
      tierLabel: tierInfo.tierLabel,
      classesNeeded,
      isNewRecord: isNew,
      tierChanged,
      notificationDispatched,
      defaulterRecord: record
    };
  } catch (err) {
    console.error(`[DefaulterService] Error evaluating student ${studentId}:`, err);
    throw err;
  }
}

/**
 * Batch evaluate all students or students matching filters (department, division)
 */
async function evaluateAllDefaulters(filters = {}, options = {}) {
  const query = { role: 'student' };
  if (filters.department) query.department = filters.department;
  if (filters.division) query.divisionName = filters.division;

  const students = await User.find(query).select('_id name email rollNo department divisionName course guardianName guardianEmail guardianPhone');

  const rules = await getSystemRules();
  const config = getDefaulterConfig(rules);

  const results = {
    totalStudents: students.length,
    evaluatedCount: 0,
    defaultersCount: 0,
    safeCount: 0,
    byTier: {
      WARNING: 0,
      SERIOUS_WARNING: 0,
      ADMIN_ALERT: 0,
      PARENT_ALERT: 0
    },
    notificationsSent: 0,
    defaulterList: []
  };

  for (const student of students) {
    try {
      const evalRes = await evaluateStudentDefaulter(student._id, {
        forceNotify: options.forceNotify || false,
        rulesOverride: rules
      });

      if (evalRes.evaluated) {
        results.evaluatedCount++;
        if (evalRes.isDefaulter) {
          results.defaultersCount++;
          results.byTier[evalRes.tier] = (results.byTier[evalRes.tier] || 0) + 1;
          if (evalRes.notificationDispatched) {
            results.notificationsSent++;
          }
          results.defaulterList.push(evalRes.defaulterRecord);
        } else {
          results.safeCount++;
        }
      }
    } catch (err) {
      console.error(`[DefaulterService] Batch eval error on ${student._id}:`, err.message);
    }
  }

  return results;
}

module.exports = {
  DEFAULT_DEFAULTER_THRESHOLDS,
  getDefaulterConfig,
  classifyDefaulterTier,
  calculateClassesNeeded,
  evaluateStudentDefaulter,
  evaluateAllDefaulters
};
