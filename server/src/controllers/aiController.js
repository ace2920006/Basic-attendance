const asyncHandler = require('../utils/asyncHandler');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');

// Helper to compute geographic distance (Haversine formula in km)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// @desc    Predict student attendance & "Can student reach 75%?" status
// @route   GET /api/ai/predict
// @access  Private (Student/Teacher/Admin)
const predictAttendance = asyncHandler(async (req, res) => {
  let studentId = req.user._id;

  // If teacher or admin passes studentId query parameter
  if ((req.user.role === 'teacher' || req.user.role === 'admin') && req.query.studentId) {
    studentId = req.query.studentId;
  }

  const student = await User.findById(studentId).select('-password');
  if (!student) {
    res.status(404);
    throw new Error('Student record not found');
  }

  // Fetch all attendance records for this student
  const attendanceRecords = await Attendance.find({ student: studentId });

  // Get enrolled / assigned subjects
  const assignedSubjects = await Subject.find({
    $or: [{ department: student.department }, { course: student.course }]
  });

  const targetPercentage = Number(req.query.target || 75);
  const defaultRemainingPerSubject = Number(req.query.remaining || 15);

  // Collect subjects list
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
  let totalConductedAll = 0;
  let totalPresentAll = 0;
  let totalAbsentAll = 0;

  const subjectBreakdown = subjectList.map((subj) => {
    const subjRecords = attendanceRecords.filter((r) => r.subject === subj);
    const conducted = subjRecords.length;
    const present = subjRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const absent = subjRecords.filter((r) => r.status === 'Absent').length;

    totalConductedAll += conducted;
    totalPresentAll += present;
    totalAbsentAll += absent;

    const currentPercent = conducted > 0 ? Number(((present / conducted) * 100).toFixed(1)) : 100;
    const remainingLectures = defaultRemainingPerSubject;
    const totalProjectedLectures = conducted + remainingLectures;

    // Minimum present needed to achieve targetPercentage
    const targetPresentNeeded = Math.ceil((targetPercentage / 100) * totalProjectedLectures);
    const requiredToAttend = Math.max(0, targetPresentNeeded - present);
    const canReach75 = present + remainingLectures >= targetPresentNeeded;

    // Maximum allowed skips
    const maxAbsencesAllowed = Math.floor(((100 - targetPercentage) / 100) * totalProjectedLectures);
    const maxSkips = Math.max(0, maxAbsencesAllowed - absent);

    let status = 'Guaranteed';
    if (!canReach75) {
      status = 'Impossible';
    } else if (currentPercent < targetPercentage) {
      status = 'At Risk';
    } else if (requiredToAttend > 0) {
      status = 'Achievable';
    }

    let recommendation = '';
    if (status === 'Guaranteed') {
      recommendation = `Great job! Your attendance is strong. You can skip up to ${maxSkips} more class(es) without falling below ${targetPercentage}%.`;
    } else if (status === 'Achievable') {
      recommendation = `You need to attend at least ${requiredToAttend} out of the next ${remainingLectures} class(es) to maintain ${targetPercentage}%.`;
    } else if (status === 'At Risk') {
      recommendation = `Warning: Your current attendance is ${currentPercent}%. You MUST attend at least ${requiredToAttend} upcoming class(es) to reach ${targetPercentage}%.`;
    } else {
      recommendation = `Critical: Even if you attend all ${remainingLectures} remaining classes, your maximum possible attendance will be ${Number((((present + remainingLectures) / totalProjectedLectures) * 100).toFixed(1))}%.`;
    }

    return {
      subject: subj,
      currentPercent,
      conducted,
      present,
      absent,
      remainingLectures,
      totalProjectedLectures,
      requiredToAttend,
      maxSkips,
      canReach75,
      status,
      recommendation
    };
  });

  // Overall calculations
  const overallConducted = totalConductedAll;
  const overallPresent = totalPresentAll;
  const overallAbsent = totalAbsentAll;
  const overallCurrentPercent = overallConducted > 0 ? Number(((overallPresent / overallConducted) * 100).toFixed(1)) : 100;
  const overallRemainingLectures = subjectList.length * defaultRemainingPerSubject;
  const overallTotalProjected = overallConducted + overallRemainingLectures;

  const overallTargetPresentNeeded = Math.ceil((targetPercentage / 100) * overallTotalProjected);
  const overallRequiredToAttend = Math.max(0, overallTargetPresentNeeded - overallPresent);
  const overallCanReach75 = overallPresent + overallRemainingLectures >= overallTargetPresentNeeded;

  const overallMaxAbsencesAllowed = Math.floor(((100 - targetPercentage) / 100) * overallTotalProjected);
  const overallMaxSkips = Math.max(0, overallMaxAbsencesAllowed - overallAbsent);

  let overallStatus = 'Guaranteed';
  if (!overallCanReach75) {
    overallStatus = 'Impossible';
  } else if (overallCurrentPercent < targetPercentage) {
    overallStatus = 'At Risk';
  } else if (overallRequiredToAttend > 0) {
    overallStatus = 'Achievable';
  }

  // Generate projection scenarios array
  const scenarios = [100, 80, 60, 40, 20, 0].map((attendRate) => {
    const attendedCount = Math.round((attendRate / 100) * overallRemainingLectures);
    const projectedFinalPercent = Number(
      (((overallPresent + attendedCount) / overallTotalProjected) * 100).toFixed(1)
    );
    return {
      attendRate,
      attendedCount,
      projectedFinalPercent,
      meetsTarget: projectedFinalPercent >= targetPercentage
    };
  });

  let overallRecommendation = '';
  if (overallCanReach75) {
    overallRecommendation = `To ensure you stay above ${targetPercentage}%, you must attend at least ${overallRequiredToAttend} out of the next ${overallRemainingLectures} scheduled lectures across all subjects. You have a safety margin of ${overallMaxSkips} skip(s).`;
  } else {
    overallRecommendation = `Action Required: Your attendance is severely lagging (${overallCurrentPercent}%). Please contact your faculty advisor to explore medical leave or duty credit options.`;
  }

  res.json({
    success: true,
    student: {
      id: student._id,
      name: student.name,
      rollNo: student.rollNo,
      department: student.department
    },
    overall: {
      currentPercent: overallCurrentPercent,
      conducted: overallConducted,
      present: overallPresent,
      absent: overallAbsent,
      remainingLectures: overallRemainingLectures,
      totalProjected: overallTotalProjected,
      requiredToAttend: overallRequiredToAttend,
      maxSkips: overallMaxSkips,
      canReach75: overallCanReach75,
      status: overallStatus,
      targetPercentage,
      recommendation: overallRecommendation,
      scenarios
    },
    subjectBreakdown
  });
});

// @desc    Natural Language AI Chatbot Query Handler
// @route   POST /api/ai/chat
// @access  Private (Student/Teacher/Admin)
const chatWithAi = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400);
    throw new Error('Please provide a message string');
  }

  const query = message.trim().toLowerCase();
  const userId = req.user._id;

  const student = await User.findById(userId);
  const records = await Attendance.find({ student: userId });

  const totalConducted = records.length;
  const totalPresent = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const totalAbsent = records.filter((r) => r.status === 'Absent').length;
  const overallPercent = totalConducted > 0 ? Number(((totalPresent / totalConducted) * 100).toFixed(1)) : 100;

  // Compute subject breakdown map
  const subjectMap = {};
  records.forEach((r) => {
    if (!subjectMap[r.subject]) {
      subjectMap[r.subject] = { conducted: 0, present: 0, absent: 0 };
    }
    subjectMap[r.subject].conducted += 1;
    if (r.status === 'Present' || r.status === 'Late') subjectMap[r.subject].present += 1;
    else subjectMap[r.subject].absent += 1;
  });

  const subjectDetails = Object.keys(subjectMap).map((subj) => {
    const d = subjectMap[subj];
    const pct = d.conducted > 0 ? Number(((d.present / d.conducted) * 100).toFixed(1)) : 100;
    return {
      subject: subj,
      conducted: d.conducted,
      present: d.present,
      absent: d.absent,
      percentage: pct
    };
  });

  const lowSubjects = subjectDetails.filter((s) => s.percentage < 75);

  let replyText = '';
  let intent = 'GENERAL';
  let cardData = null;

  // 1. INTENT: MY ATTENDANCE
  if (
    query.includes('my attendance') ||
    query.includes('attendance percentage') ||
    query.includes('overall status') ||
    query.includes('how is my attendance') ||
    query === 'my attendance?'
  ) {
    intent = 'MY_ATTENDANCE';
    replyText = `### 📊 Your Attendance Summary\n\nYour current overall attendance is **${overallPercent}%** (${totalPresent} present out of ${totalConducted} total classes conducted).\n\n` +
      (overallPercent >= 75
        ? `✅ **Status: Safe & Compliant**\nYou are above the mandatory 75% threshold!`
        : `⚠️ **Status: Warning - Below Target**\nYour attendance is currently below the required 75%. Please attend upcoming lectures.`);

    cardData = {
      type: 'attendance_overview',
      overallPercent,
      totalConducted,
      totalPresent,
      totalAbsent,
      subjects: subjectDetails
    };
  }

  // 2. INTENT: SUBJECTS BELOW 75%
  else if (
    query.includes('below 75') ||
    query.includes('subjects below 75%') ||
    query.includes('low attendance') ||
    query.includes('defaulter') ||
    query.includes('lagging') ||
    query === 'subjects below 75%?'
  ) {
    intent = 'LOW_ATTENDANCE_SUBJECTS';
    if (lowSubjects.length === 0) {
      replyText = `🎉 **Great news!** None of your subjects are below 75%. All your enrolled subjects have safe attendance ratios.\n\nKeep up the consistent attendance!`;
    } else {
      replyText = `⚠️ **Alert: ${lowSubjects.length} Subject(s) Below 75%**\n\nThe following subjects require immediate attention to avoid exam hall ticket restrictions:\n\n` +
        lowSubjects
          .map(
            (s) =>
              `- **${s.subject}**: ${s.percentage}% (${s.present}/${s.conducted} attended). You need to attend upcoming classes without missing any!`
          )
          .join('\n');
    }

    cardData = {
      type: 'low_subjects_list',
      count: lowSubjects.length,
      subjects: lowSubjects
    };
  }

  // 3. INTENT: CAN I SKIP TOMORROW?
  else if (
    query.includes('skip tomorrow') ||
    query.includes('can i skip tomorrow') ||
    query.includes('bunk tomorrow') ||
    query.includes('miss class tomorrow') ||
    query.includes('absent tomorrow')
  ) {
    intent = 'CAN_I_SKIP_TOMORROW';

    // Get tomorrow's day name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const tomorrowIndex = (new Date().getDay() + 1) % 7;
    const tomorrowDay = days[tomorrowIndex];

    const tomorrowClasses = await Timetable.find({
      day: tomorrowDay,
      department: student.department || 'Computer Science & Engineering'
    });

    if (tomorrowClasses.length === 0) {
      replyText = `📅 **No Scheduled Classes Tomorrow (${tomorrowDay})**\n\nYou have no timetable slots scheduled for tomorrow, so you don't need to worry about skipping any lectures! Enjoy your day off or revision time.`;
    } else {
      let skipAnalysis = [];
      let highRiskCount = 0;

      tomorrowClasses.forEach((cls) => {
        const subjInfo = subjectMap[cls.subject] || { conducted: 10, present: 8, absent: 2 };
        const newConducted = subjInfo.conducted + 1;
        const newPresentIfSkipped = subjInfo.present;
        const newPercentIfSkipped = Number(((newPresentIfSkipped / newConducted) * 100).toFixed(1));
        const dropsBelow75 = newPercentIfSkipped < 75;

        if (dropsBelow75) highRiskCount++;

        skipAnalysis.push({
          subject: cls.subject,
          timeSlot: cls.timeSlot || `${cls.startTime} - ${cls.endTime}`,
          currentPercent: subjInfo.conducted > 0 ? Number(((subjInfo.present / subjInfo.conducted) * 100).toFixed(1)) : 100,
          projectedIfSkipped: newPercentIfSkipped,
          isHighRisk: dropsBelow75
        });
      });

      if (highRiskCount > 0) {
        replyText = `⛔ **Skipping Tomorrow is NOT Recommended!**\n\nYou have **${tomorrowClasses.length} class(es)** scheduled for tomorrow (${tomorrowDay}). Skipping will drop your attendance below 75% in **${highRiskCount} subject(s)**.\n\n` +
          skipAnalysis
            .map(
              (a) =>
                `- **${a.subject}** (${a.timeSlot}): Current **${a.currentPercent}%** $\\rightarrow$ If skipped: **${a.projectedIfSkipped}%** ${a.isHighRisk ? '🚨 (BELOW 75%)' : '✅ (Safe)'}`
            )
            .join('\n');
      } else {
        replyText = `👍 **Skipping Tomorrow is Feasible, but use caution!**\n\nYou have **${tomorrowClasses.length} class(es)** scheduled for tomorrow (${tomorrowDay}). Your attendance buffer in these subjects is strong enough that skipping will keep you above 75%:\n\n` +
          skipAnalysis
            .map(
              (a) =>
                `- **${a.subject}** (${a.timeSlot}): Current **${a.currentPercent}%** $\\rightarrow$ If skipped: **${a.projectedIfSkipped}%** ✅`
            )
            .join('\n');
      }

      cardData = {
        type: 'skip_tomorrow_analysis',
        day: tomorrowDay,
        highRiskCount,
        classes: skipAnalysis
      };
    }
  }

  // 4. INTENT: ATTENDANCE REPORT
  else if (
    query.includes('attendance report') ||
    query.includes('download report') ||
    query.includes('summary report') ||
    query.includes('my report') ||
    query === 'attendance report?'
  ) {
    intent = 'ATTENDANCE_REPORT';
    replyText = `📑 **Official Attendance Report Summary**\n\n- **Student Name**: ${student.name}\n- **Roll Number**: ${student.rollNo || 'N/A'}\n- **Department**: ${student.department}\n- **Total Conducted**: ${totalConducted}\n- **Present Count**: ${totalPresent}\n- **Absent Count**: ${totalAbsent}\n- **Overall Attendance**: **${overallPercent}%**\n\nYou can view and download your full official PDF/Excel report from the **Download Report** section.`;

    cardData = {
      type: 'report_link',
      actionUrl: '/student/report',
      actionLabel: 'Download Full Report'
    };
  }

  // 5. INTENT: REMAINING LECTURES
  else if (
    query.includes('remaining lectures') ||
    query.includes('classes left') ||
    query.includes('how many lectures left') ||
    query.includes('remaining classes') ||
    query === 'remaining lectures?'
  ) {
    intent = 'REMAINING_LECTURES';
    const estimatedRemaining = 15;
    const totalSubjects = subjectDetails.length || 4;
    const totalRemainingAll = totalSubjects * estimatedRemaining;
    const targetPresentNeeded = Math.ceil(0.75 * (totalConducted + totalRemainingAll));
    const mandatoryAttend = Math.max(0, targetPresentNeeded - totalPresent);

    replyText = `⏳ **Remaining Semester Lectures Overview**\n\n- **Estimated Remaining Lectures**: ~${totalRemainingAll} total (${estimatedRemaining} per subject)\n- **Current Present Count**: ${totalPresent} / ${totalConducted}\n- **Must Attend**: At least **${mandatoryAttend}** of the remaining ${totalRemainingAll} lectures to stay above 75%.\n- **Maximum Skips Left**: **${Math.max(0, Math.floor(0.25 * (totalConducted + totalRemainingAll)) - totalAbsent)}** lectures.`;

    cardData = {
      type: 'remaining_lectures_info',
      totalRemainingAll,
      mandatoryAttend,
      estimatedRemainingPerSubject: estimatedRemaining
    };
  }

  // 6. DEFAULT / GENERAL QUERY HANDLER
  else {
    replyText = `🤖 **AI Attendance Assistant**\n\nI can help you analyze your attendance statistics, predict target requirements, check tomorrow's classes, and review proxy security logs!\n\nHere are quick queries you can ask me:\n- 💬 *"My attendance?"*\n- 💬 *"Subjects below 75%"*\n- 💬 *"Can I skip tomorrow?"*\n- 💬 *"Attendance report"*\n- 💬 *"Remaining lectures"*`;

    cardData = {
      type: 'general_help',
      suggestions: [
        'My attendance?',
        'Subjects below 75%',
        'Can I skip tomorrow?',
        'Attendance report',
        'Remaining lectures'
      ]
    };
  }

  res.json({
    success: true,
    message: query,
    intent,
    reply: replyText,
    cardData
  });
});

// @desc    Detect Suspicious & Proxy Attendance Logs
// @route   GET /api/ai/suspicious-detection
// @access  Private (Teacher/Admin)
const detectSuspiciousAttendance = asyncHandler(async (req, res) => {
  const { type = 'all', severity = 'all', search = '' } = req.query;

  // Fetch all attendance logs populated with student data
  const allLogs = await Attendance.find({})
    .populate('student', 'name rollNo email department course avatar')
    .sort({ createdAt: -1 });

  const anomalies = [];

  // 1. SCANNER: Repeated Same Device
  // Group logs by deviceFingerprint (or browserId) and class/date window
  const deviceGroupMap = {};
  allLogs.forEach((log) => {
    const fp = log.deviceInfo?.deviceFingerprint || log.deviceInfo?.browserId;
    if (fp && fp.length > 3) {
      if (!deviceGroupMap[fp]) {
        deviceGroupMap[fp] = [];
      }
      deviceGroupMap[fp].push(log);
    }
  });

  Object.keys(deviceGroupMap).forEach((fp) => {
    const logs = deviceGroupMap[fp];
    // Check if multiple distinct student IDs used this exact same device fingerprint
    const distinctStudents = new Set();
    logs.forEach((l) => l.student?._id && distinctStudents.add(l.student._id.toString()));

    if (distinctStudents.size > 1) {
      logs.forEach((log) => {
        if (log.student) {
          anomalies.push({
            id: `SAME_DEVICE_${log._id}`,
            logId: log._id,
            type: 'REPEATED_SAME_DEVICE',
            typeLabel: 'Repeated Same Device',
            severity: distinctStudents.size > 2 ? 'High' : 'Medium',
            student: log.student,
            subject: log.subject,
            date: log.date || log.createdAt,
            verificationMethod: log.verificationMethod,
            reason: `Device fingerprint '${fp.substring(0, 12)}...' was used by ${distinctStudents.size} different students to mark attendance. Potential proxy attendance attempt.`,
            details: {
              deviceFingerprint: fp,
              ipAddress: log.deviceInfo?.ipAddress || '192.168.1.45',
              browserId: log.deviceInfo?.browserId || 'N/A',
              sharedWithStudentsCount: distinctStudents.size
            },
            status: 'Unresolved'
          });
        }
      });
    }
  });

  // 2. SCANNER: Outside Campus
  allLogs.forEach((log) => {
    if (log.student && (log.verificationMethod === 'QR' || log.verificationMethod === 'GPS')) {
      const isOutOfBounds = log.location?.isWithinBounds === false;
      const distance = log.location?.distanceMeters || 0;

      if (isOutOfBounds || distance > 500) {
        anomalies.push({
          id: `OUTSIDE_CAMPUS_${log._id}`,
          logId: log._id,
          type: 'OUTSIDE_CAMPUS',
          typeLabel: 'Outside Campus Scan',
          severity: distance > 2000 ? 'High' : 'Medium',
          student: log.student,
          subject: log.subject,
          date: log.date || log.createdAt,
          verificationMethod: log.verificationMethod,
          reason: `Attendance marked via ${log.verificationMethod} from ${Math.round(distance)}m outside the designated campus GPS radius boundary.`,
          details: {
            latitude: log.location?.latitude || 28.6139,
            longitude: log.location?.longitude || 77.209,
            distanceMeters: Math.round(distance),
            isWithinBounds: false
          },
          status: 'Unresolved'
        });
      }
    }
  });

  // 3. SCANNER: Duplicate QR Scans
  // Find cases where a student scanned multiple times for the same subject within 5 minutes
  const studentSubjectTimeMap = {};
  allLogs.forEach((log) => {
    if (log.student && log.verificationMethod === 'QR') {
      const key = `${log.student._id}_${log.subject}`;
      if (!studentSubjectTimeMap[key]) {
        studentSubjectTimeMap[key] = [];
      }
      studentSubjectTimeMap[key].push(log);
    }
  });

  Object.keys(studentSubjectTimeMap).forEach((key) => {
    const logs = studentSubjectTimeMap[key];
    if (logs.length > 1) {
      for (let i = 0; i < logs.length - 1; i++) {
        const t1 = new Date(logs[i].createdAt || logs[i].date).getTime();
        const t2 = new Date(logs[i + 1].createdAt || logs[i + 1].date).getTime();
        const diffMinutes = Math.abs(t1 - t2) / (1000 * 60);

        if (diffMinutes < 5) {
          anomalies.push({
            id: `DUPLICATE_QR_${logs[i]._id}`,
            logId: logs[i]._id,
            type: 'DUPLICATE_QR',
            typeLabel: 'Duplicate QR Code Scan',
            severity: 'Medium',
            student: logs[i].student,
            subject: logs[i].subject,
            date: logs[i].date || logs[i].createdAt,
            verificationMethod: 'QR',
            reason: `Multiple QR scans detected for ${logs[i].subject} within ${diffMinutes.toFixed(1)} minutes. Token reuse or multiple scans.`,
            details: {
              timeDiffMinutes: Number(diffMinutes.toFixed(1)),
              ipAddress: logs[i].deviceInfo?.ipAddress || '127.0.0.1'
            },
            status: 'Unresolved'
          });
          break;
        }
      }
    }
  });

  // 4. SCANNER: Impossible Locations (Velocity Anomaly)
  const studentLogsSortedMap = {};
  allLogs.forEach((log) => {
    if (log.student && log.location?.latitude && log.location?.longitude) {
      const sId = log.student._id.toString();
      if (!studentLogsSortedMap[sId]) {
        studentLogsSortedMap[sId] = [];
      }
      studentLogsSortedMap[sId].push(log);
    }
  });

  Object.keys(studentLogsSortedMap).forEach((sId) => {
    const sLogs = studentLogsSortedMap[sId].sort(
      (a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
    );

    for (let i = 0; i < sLogs.length - 1; i++) {
      const l1 = sLogs[i];
      const l2 = sLogs[i + 1];
      const t1 = new Date(l1.date || l1.createdAt).getTime();
      const t2 = new Date(l2.date || l2.createdAt).getTime();
      const timeDiffHours = Math.abs(t2 - t1) / (1000 * 3600);

      if (timeDiffHours > 0 && timeDiffHours < 1) {
        const distKm = calculateHaversineDistance(
          l1.location.latitude,
          l1.location.longitude,
          l2.location.latitude,
          l2.location.longitude
        );

        const speedKmH = distKm / timeDiffHours;
        if (distKm > 5 && speedKmH > 100) {
          anomalies.push({
            id: `IMPOSSIBLE_LOCATION_${l2._id}`,
            logId: l2._id,
            type: 'IMPOSSIBLE_LOCATIONS',
            typeLabel: 'Impossible Physical Location',
            severity: 'High',
            student: l2.student,
            subject: l2.subject,
            date: l2.date || l2.createdAt,
            verificationMethod: l2.verificationMethod,
            reason: `Travel speed of ${Math.round(speedKmH)} km/h required between sequential scans (${distKm.toFixed(1)} km in ${Math.round(timeDiffHours * 60)} minutes). Teleportation / spoofed GPS detected.`,
            details: {
              distanceKm: Number(distKm.toFixed(1)),
              timeDiffMinutes: Math.round(timeDiffHours * 60),
              speedKmH: Math.round(speedKmH)
            },
            status: 'Unresolved'
          });
        }
      }
    }
  });

  // Filter by anomaly type if requested
  let filtered = anomalies;
  if (type && type !== 'all') {
    filtered = filtered.filter((a) => a.type.toLowerCase() === type.toLowerCase());
  }

  if (severity && severity !== 'all') {
    filtered = filtered.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.student?.name?.toLowerCase().includes(q) ||
        a.student?.rollNo?.toLowerCase().includes(q) ||
        a.subject?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q)
    );
  }

  // Calculate summary counts
  const summary = {
    totalFlagged: anomalies.length,
    repeatedSameDevice: anomalies.filter((a) => a.type === 'REPEATED_SAME_DEVICE').length,
    outsideCampus: anomalies.filter((a) => a.type === 'OUTSIDE_CAMPUS').length,
    duplicateQr: anomalies.filter((a) => a.type === 'DUPLICATE_QR').length,
    impossibleLocations: anomalies.filter((a) => a.type === 'IMPOSSIBLE_LOCATIONS').length,
    highSeverity: anomalies.filter((a) => a.severity === 'High').length
  };

  res.json({
    success: true,
    summary,
    anomalies: filtered
  });
});

module.exports = {
  predictAttendance,
  chatWithAi,
  detectSuspiciousAttendance
};
