/**
 * Phase 26: Attendance Forecasting Engine Utility
 *
 * Implements mathematically verified formulas for:
 * 1. Recovery requirement: "How many consecutive classes must I attend to reach R%?"
 * 2. Safe miss allowance: "How many consecutive classes can I miss and stay >= R%?"
 * 3. Scenario calculation: "Can I skip K classes and attend A classes?"
 * 4. Milestone trajectories: Milestones for 75%, 80%, 85%, 90%
 * 5. Full semester projection: Future classes simulation (100%, 75%, 50%, 0%)
 */

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

/**
 * Calculates the number of consecutive attended classes needed to bring attendance from < target% to >= target%.
 *
 * Formula Proof:
 * (P + x) / (T + x) >= r
 * P + x >= rT + rx
 * x(1 - r) >= rT - P
 * x >= (rT - P) / (1 - r)
 *
 * @param {Object} params
 * @param {number} params.attended - Current attended classes (P)
 * @param {number} params.total - Current total conducted classes (T)
 * @param {number} [params.targetPercentage=75] - Required percentage target (R)
 * @returns {number} Minimum consecutive attended classes required (x)
 */
function calculateConsecutiveNeeded({ attended = 0, total = 0, targetPercentage = 75 }) {
  const P = Math.max(0, Number(attended) || 0);
  const T = Math.max(0, Number(total) || 0);
  const target = Math.min(100, Math.max(1, Number(targetPercentage) || 75));
  const r = target / 100;

  if (T === 0) return 0;
  if (P / T >= r) return 0; // Already at or above target

  // When target is 100%, if student has missed any class, 100% is impossible
  if (r >= 1) {
    return P === T ? 0 : Infinity;
  }

  const numerator = r * T - P;
  const denominator = 1 - r;
  const needed = Math.ceil(numerator / denominator);
  return Math.max(1, needed);
}

/**
 * Calculates the number of consecutive classes a student can miss without dropping below target%.
 *
 * Formula Proof:
 * P / (T + m) >= r
 * P >= rT + rm
 * rm <= P - rT
 * m <= (P - rT) / r = P/r - T
 *
 * @param {Object} params
 * @param {number} params.attended - Current attended classes (P)
 * @param {number} params.total - Current total conducted classes (T)
 * @param {number} [params.targetPercentage=75] - Required percentage target (R)
 * @returns {number} Maximum consecutive classes that can be missed safely (m)
 */
function calculateSafeMisses({ attended = 0, total = 0, targetPercentage = 75 }) {
  const P = Math.max(0, Number(attended) || 0);
  const T = Math.max(0, Number(total) || 0);
  const target = Math.min(100, Math.max(1, Number(targetPercentage) || 75));
  const r = target / 100;

  if (T === 0) return 0;
  if (P / T < r) return 0; // Below target, 0 safe misses

  const maxMisses = Math.floor(P / r - T);
  return Math.max(0, maxMisses);
}

/**
 * Evaluates the "Can I skip?" scenario when a student proposes skipping `skipCount` classes and attending `attendCount` classes.
 *
 * @param {Object} params
 * @param {number} params.attended - Current attended classes (P)
 * @param {number} params.total - Current total conducted classes (T)
 * @param {number} [params.skipCount=1] - Proposed future classes to skip (b)
 * @param {number} [params.attendCount=0] - Proposed future classes to attend (a)
 * @param {number} [params.targetPercentage=75] - Target percentage (R)
 * @returns {Object} Scenario analysis result
 */
function calculateCanSkip({
  attended = 0,
  total = 0,
  skipCount = 1,
  attendCount = 0,
  targetPercentage = 75
}) {
  const P = Math.max(0, Number(attended) || 0);
  const T = Math.max(0, Number(total) || 0);
  const skips = Math.max(0, Number(skipCount) || 0);
  const attends = Math.max(0, Number(attendCount) || 0);
  const target = Math.min(100, Math.max(1, Number(targetPercentage) || 75));
  const r = target / 100;

  const currentPercentage = T > 0 ? Number(((P / T) * 100).toFixed(2)) : 100;
  const projectedTotal = T + attends + skips;
  const projectedAttended = P + attends;
  const projectedPercentage =
    projectedTotal > 0 ? Number(((projectedAttended / projectedTotal) * 100).toFixed(2)) : 100;

  const percentageDelta = Number((projectedPercentage - currentPercentage).toFixed(2));
  const canSkip = projectedPercentage >= target;

  // Calculate remaining safe buffer after this scenario
  let bufferAfter = 0;
  let penaltyAfter = 0;

  if (canSkip) {
    bufferAfter = calculateSafeMisses({
      attended: projectedAttended,
      total: projectedTotal,
      targetPercentage: target
    });
  } else {
    penaltyAfter = calculateConsecutiveNeeded({
      attended: projectedAttended,
      total: projectedTotal,
      targetPercentage: target
    });
  }

  let status = 'SAFE';
  let statusText = 'Safe to Skip';
  if (!canSkip) {
    status = projectedPercentage < target - 10 ? 'CRITICAL_DROP' : 'DEFICIT_WARNING';
    statusText = projectedPercentage < target - 10 ? 'Critical Shortage' : 'Below Target';
  } else if (bufferAfter === 0) {
    status = 'BORDERLINE';
    statusText = 'Borderline Safe (0 Buffer Left)';
  }

  let actionableAdvice = '';
  if (canSkip) {
    actionableAdvice = `You can safely proceed with this scenario. Your attendance will be ${projectedPercentage}%, remaining ${Number((projectedPercentage - target).toFixed(1))}% above your ${target}% goal. You will have ${bufferAfter} additional safe skip(s) remaining.`;
  } else {
    actionableAdvice = `Skipping will drop your attendance to ${projectedPercentage}%, falling below your ${target}% target. You would need ${penaltyAfter} consecutive attended lectures after this to recover.`;
  }

  return {
    current: {
      attended: P,
      total: T,
      percentage: currentPercentage
    },
    scenario: {
      skipCount: skips,
      attendCount: attends,
      targetPercentage: target
    },
    projected: {
      attended: projectedAttended,
      total: projectedTotal,
      percentage: projectedPercentage,
      percentageDelta,
      canSkip,
      status,
      statusText,
      bufferAfter,
      penaltyAfter,
      actionableAdvice
    }
  };
}

/**
 * Calculates recovery milestones for multiple target percentage benchmarks (75%, 80%, 85%, 90%, 95%).
 *
 * @param {Object} params
 * @param {number} params.attended
 * @param {number} params.total
 * @returns {Array} Milestones breakdown
 */
function calculateMilestones({ attended = 0, total = 0 }) {
  const P = Math.max(0, Number(attended) || 0);
  const T = Math.max(0, Number(total) || 0);
  const benchmarks = [75, 80, 85, 90, 95];

  return benchmarks.map((target) => {
    const isMet = T > 0 ? (P / T) * 100 >= target : true;
    const consecutiveNeeded = isMet
      ? 0
      : calculateConsecutiveNeeded({ attended: P, total: T, targetPercentage: target });
    const safeMisses = isMet
      ? calculateSafeMisses({ attended: P, total: T, targetPercentage: target })
      : 0;

    return {
      target,
      isMet,
      consecutiveNeeded,
      safeMisses,
      status: isMet ? 'ACHIEVED' : consecutiveNeeded <= 5 ? 'EASY_REACH' : 'NEEDS_DEDICATION'
    };
  });
}

/**
 * Comprehensive Attendance Forecast calculation combining current stats, future class simulations, and milestones.
 *
 * @param {Object} params
 * @param {number} params.attended - Attended classes
 * @param {number} params.total - Conducted classes
 * @param {number} [params.targetPercentage=75] - Target %
 * @param {number} [params.futureClasses=15] - Projected future classes in horizon
 * @param {string} [params.subject=''] - Optional subject name
 * @returns {Object} Complete forecasting report
 */
function calculateAttendanceForecast({
  attended = 0,
  total = 0,
  targetPercentage = 75,
  futureClasses = 15,
  subject = ''
}) {
  const P = Math.max(0, Number(attended) || 0);
  const T = Math.max(0, Number(total) || 0);
  const F = Math.max(0, Number(futureClasses) || 0);
  const target = Math.min(100, Math.max(1, Number(targetPercentage) || 75));

  const currentPercent = T > 0 ? Number(((P / T) * 100).toFixed(2)) : 100;
  const consecutiveNeeded = calculateConsecutiveNeeded({
    attended: P,
    total: T,
    targetPercentage: target
  });
  const safeMisses = calculateSafeMisses({
    attended: P,
    total: T,
    targetPercentage: target
  });

  // Future scenarios simulations:
  // Scenario 1: Attend 100% of future classes
  const maxPossibleAttended = P + F;
  const maxPossibleTotal = T + F;
  const maxPossiblePercent =
    maxPossibleTotal > 0 ? Number(((maxPossibleAttended / maxPossibleTotal) * 100).toFixed(2)) : 100;

  // Scenario 2: Attend target% of future classes
  const targetFutureAttended = P + Math.round((target / 100) * F);
  const targetFuturePercent =
    maxPossibleTotal > 0 ? Number(((targetFutureAttended / maxPossibleTotal) * 100).toFixed(2)) : 100;

  // Scenario 3: Attend 50% of future classes
  const halfFutureAttended = P + Math.round(0.5 * F);
  const halfFuturePercent =
    maxPossibleTotal > 0 ? Number(((halfFutureAttended / maxPossibleTotal) * 100).toFixed(2)) : 100;

  // Scenario 4: Attend 0% of future classes (Worst case floor)
  const minFloorPercent =
    maxPossibleTotal > 0 ? Number(((P / maxPossibleTotal) * 100).toFixed(2)) : 100;

  // Overall viability
  const canAchieveTarget = maxPossiblePercent >= target;

  // Future classes required to attend out of F
  const requiredOutOFuture = Math.max(0, Math.ceil((target / 100) * maxPossibleTotal - P));
  const maxSkipsOutOfFuture = Math.max(
    0,
    Math.min(F, Math.floor((1 - target / 100) * maxPossibleTotal - (T - P)))
  );

  let statusBadge = 'Guaranteed';
  if (!canAchieveTarget) {
    statusBadge = 'Impossible';
  } else if (currentPercent < target) {
    statusBadge = 'At Risk';
  } else if (requiredOutOFuture > 0) {
    statusBadge = 'Achievable';
  }

  // Summary recommendation text
  let summaryText = '';
  const subjPrefix = subject ? `In ${subject}, your` : 'Your';
  if (currentPercent < target) {
    if (canAchieveTarget) {
      summaryText = `${subjPrefix} attendance is currently ${currentPercent}%. You need ${consecutiveNeeded} consecutive attended lectures to reach ${target}%. Out of ${F} remaining classes, you must attend at least ${requiredOutOFuture}.`;
    } else {
      summaryText = `${subjPrefix} attendance is ${currentPercent}%. Even if you attend all ${F} remaining classes, your maximum possible attendance will be ${maxPossiblePercent}% (below ${target}%).`;
    }
  } else {
    summaryText = `${subjPrefix} attendance is strong at ${currentPercent}%. You can miss up to ${safeMisses} consecutive lectures (or ${maxSkipsOutOfFuture} out of ${F} future classes) and remain above ${target}%.`;
  }

  const milestones = calculateMilestones({ attended: P, total: T });

  return {
    subject,
    current: {
      attended: P,
      conducted: T,
      absent: T - P,
      percentage: currentPercent
    },
    parameters: {
      targetPercentage: target,
      futureClasses: F
    },
    metrics: {
      consecutiveNeeded,
      safeMisses,
      canAchieveTarget,
      requiredOutOFuture: Math.min(F, requiredOutOFuture),
      maxSkipsOutOfFuture,
      statusBadge,
      summaryText
    },
    trajectories: {
      maxPossiblePercent,
      targetFuturePercent,
      halfFuturePercent,
      minFloorPercent
    },
    milestones
  };
}

/**
 * Aggregates actual attendance records for a student across all enrolled subjects, computing forecasting metrics.
 *
 * @param {Object} params
 * @param {string} params.studentId
 * @param {number} [params.targetPercentage=75]
 * @param {number} [params.defaultFutureClasses=15]
 * @returns {Promise<Object>} Aggregated student subjects forecast
 */
async function getStudentSubjectForecasts({
  studentId,
  targetPercentage = 75,
  defaultFutureClasses = 15
}) {
  const student = await User.findById(studentId).select('-password');
  if (!student) {
    throw new Error('Student record not found');
  }

  // Fetch actual attendance records
  const attendanceRecords = await Attendance.find({ student: studentId });

  // Get assigned / enrolled subjects
  const assignedSubjects = await Subject.find({
    $or: [{ department: student.department }, { course: student.course }]
  });

  const subjectSet = new Set();
  attendanceRecords.forEach((r) => r.subject && subjectSet.add(r.subject));
  assignedSubjects.forEach((s) => s.name && subjectSet.add(s.name));

  if (subjectSet.size === 0) {
    subjectSet.add('Computer Networks');
    subjectSet.add('Database Systems');
    subjectSet.add('Operating Systems');
    subjectSet.add('Software Engineering');
  }

  const subjectList = Array.from(subjectSet);
  let totalAttendedAll = 0;
  let totalConductedAll = 0;

  const subjectsForecast = subjectList.map((subj) => {
    const subjRecords = attendanceRecords.filter((r) => r.subject === subj);
    const conducted = subjRecords.length;
    const attended = subjRecords.filter(
      (r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Excused'
    ).length;

    totalAttendedAll += attended;
    totalConductedAll += conducted;

    return calculateAttendanceForecast({
      attended,
      total: conducted,
      targetPercentage,
      futureClasses: defaultFutureClasses,
      subject: subj
    });
  });

  const overallForecast = calculateAttendanceForecast({
    attended: totalAttendedAll,
    total: totalConductedAll,
    targetPercentage,
    futureClasses: subjectList.length * defaultFutureClasses,
    subject: 'Overall Cumulative'
  });

  // Summary counts
  const belowTargetSubjects = subjectsForecast.filter(
    (s) => s.current.percentage < targetPercentage
  );
  const safeSubjects = subjectsForecast.filter(
    (s) => s.current.percentage >= targetPercentage
  );

  return {
    student: {
      _id: student._id,
      name: student.name,
      rollNo: student.rollNo,
      department: student.department
    },
    targetPercentage,
    defaultFutureClasses,
    summary: {
      totalSubjects: subjectList.length,
      safeSubjectsCount: safeSubjects.length,
      belowTargetCount: belowTargetSubjects.length,
      overallPercentage: overallForecast.current.percentage,
      overallSafeMisses: overallForecast.metrics.safeMisses,
      overallConsecutiveNeeded: overallForecast.metrics.consecutiveNeeded,
      statusBadge: overallForecast.metrics.statusBadge
    },
    overallForecast,
    subjects: subjectsForecast
  };
}

module.exports = {
  calculateConsecutiveNeeded,
  calculateSafeMisses,
  calculateCanSkip,
  calculateMilestones,
  calculateAttendanceForecast,
  getStudentSubjectForecasts
};
