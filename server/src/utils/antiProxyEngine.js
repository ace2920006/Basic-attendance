const Attendance = require('../models/Attendance');
const { getDistanceInMeters } = require('./geoUtils');

/**
 * Calculates Haversine distance in kilometers between two geographic coordinates
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
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

/**
 * Evaluates 6 multi-signal risk factors for incoming attendance scan:
 * 1. QR Token Validity & Expiration
 * 2. GPS Location & Campus Geofence Boundary
 * 3. Session Time Window
 * 4. Device Fingerprint Multi-Account Sharing
 * 5. IP Address Scan Burst Concurrency
 * 6. Attendance Pattern & Device Switch Anomaly
 *
 * @param {Object} scanContext
 * @returns {Promise<Object>} { riskScore, riskLevel, riskSignals, reviewStatus, isSuspicious }
 */
async function evaluateAttendanceRisk(scanContext) {
  const {
    studentId,
    subjectCode,
    classId,
    sessionId,
    qrTokenValid = true,
    qrTokenExpired = false,
    location = {},
    deviceInfo = {},
    sessionInfo = null,
    scanTimestamp = new Date()
  } = scanContext;

  const riskSignals = [];
  let totalScore = 0;

  // 1. SIGNAL 1: QR TOKEN
  if (!qrTokenValid) {
    totalScore += 50;
    riskSignals.push({
      signal: 'QR Token',
      status: 'FLAGGED',
      scoreContribution: 50,
      reason: 'Invalid or untrusted QR code payload (QR Token ❌)'
    });
  } else if (qrTokenExpired) {
    totalScore += 35;
    riskSignals.push({
      signal: 'QR Token',
      status: 'WARNING',
      scoreContribution: 35,
      reason: 'QR token expired (scanned after 30s rotation window)'
    });
  } else {
    riskSignals.push({
      signal: 'QR Token',
      status: 'PASSED',
      scoreContribution: 0,
      reason: 'Valid 30s dynamic QR code token'
    });
  }

  // 2. SIGNAL 2: GPS GEOLOCATION
  const { latitude, longitude, distanceMeters, maxRadiusMeters = 500, isWithinBounds } = location;

  if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) {
    if (isWithinBounds === false || (distanceMeters !== null && distanceMeters > maxRadiusMeters)) {
      totalScore += 40;
      riskSignals.push({
        signal: 'GPS',
        status: 'FLAGGED',
        scoreContribution: 40,
        reason: `Wrong GPS: Scanned from ${Math.round(distanceMeters || 0)}m away (${Math.round(Math.max(0, (distanceMeters || 0) - maxRadiusMeters))}m outside ${maxRadiusMeters}m boundary) (GPS ❌)`
      });
    } else {
      riskSignals.push({
        signal: 'GPS',
        status: 'PASSED',
        scoreContribution: 0,
        reason: `Within valid campus radius (${Math.round(distanceMeters || 0)}m / ${maxRadiusMeters}m)`
      });
    }

    // Velocity Anomaly check (Speed > 150 km/h from last scan)
    try {
      const lastScanWithLoc = await Attendance.findOne({
        student: studentId,
        'location.latitude': { $ne: null }
      }).sort({ createdAt: -1 });

      if (lastScanWithLoc && lastScanWithLoc.location?.latitude) {
        const timeDiffHours = Math.abs(new Date(scanTimestamp) - new Date(lastScanWithLoc.createdAt)) / (1000 * 3600);
        if (timeDiffHours > 0 && timeDiffHours < 1) {
          const distKm = calculateHaversineDistance(
            lastScanWithLoc.location.latitude,
            lastScanWithLoc.location.longitude,
            latitude,
            longitude
          );
          const speedKmH = distKm / timeDiffHours;
          if (distKm > 3 && speedKmH > 150) {
            totalScore += 60;
            riskSignals.push({
              signal: 'GPS',
              status: 'FLAGGED',
              scoreContribution: 60,
              reason: `Velocity Anomaly: Required travel speed ${Math.round(speedKmH)} km/h between sequential scans (${distKm.toFixed(1)} km in ${Math.round(timeDiffHours * 60)} mins)`
            });
          }
        }
      }
    } catch (err) {
      console.error('Error during velocity anomaly check:', err.message);
    }
  } else {
    totalScore += 20;
    riskSignals.push({
      signal: 'GPS',
      status: 'WARNING',
      scoreContribution: 20,
      reason: 'GPS geolocation coordinates not provided'
    });
  }

  // 3. SIGNAL 3: SESSION TIME WINDOW & UNUSUAL TIMING
  if (sessionInfo) {
    const scanTime = new Date(scanTimestamp).getTime();
    const startTime = sessionInfo.startTime ? new Date(sessionInfo.startTime).getTime() : null;
    const endTime = sessionInfo.endTime ? new Date(sessionInfo.endTime).getTime() : null;

    if (sessionInfo.status === 'Completed' || sessionInfo.status === 'Expired' || (endTime && scanTime > endTime + 60000)) {
      totalScore += 30;
      riskSignals.push({
        signal: 'Time',
        status: 'FLAGGED',
        scoreContribution: 30,
        reason: 'Unusual timing: Submitted after session completed or expired (Time ❌)'
      });
    } else if (startTime && scanTime < startTime - 300000) {
      totalScore += 10;
      riskSignals.push({
        signal: 'Time',
        status: 'WARNING',
        scoreContribution: 10,
        reason: 'Unusual timing: Submitted before session start window'
      });
    } else {
      riskSignals.push({
        signal: 'Time',
        status: 'PASSED',
        scoreContribution: 0,
        reason: 'Submitted during active session time window'
      });
    }
  } else {
    riskSignals.push({
      signal: 'Time',
      status: 'PASSED',
      scoreContribution: 0,
      reason: 'Submitted during standard class window'
    });
  }

  // 4. SIGNAL 4: DEVICE FINGERPRINT & DUPLICATE DEVICE REUSE
  const fingerprint = deviceInfo.deviceFingerprint || deviceInfo.browserId;
  if (fingerprint && fingerprint.length > 3) {
    try {
      const startOfDay = new Date(scanTimestamp);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(scanTimestamp);
      endOfDay.setHours(23, 59, 59, 999);

      // Find other attendance records with same device fingerprint today for DIFFERENT students
      const otherStudentsRecords = await Attendance.find({
        date: { $gte: startOfDay, $lte: endOfDay },
        student: { $ne: studentId },
        $or: [
          { 'deviceInfo.deviceFingerprint': fingerprint },
          { 'deviceInfo.browserId': fingerprint }
        ]
      });

      const distinctOtherStudents = new Set(otherStudentsRecords.map((r) => r.student.toString()));

      if (distinctOtherStudents.size >= 2) {
        totalScore += 60;
        riskSignals.push({
          signal: 'Device',
          status: 'FLAGGED',
          scoreContribution: 60,
          reason: `Duplicate device cluster: Physical device shared across ${distinctOtherStudents.size + 1} different student accounts today 🚨`
        });
      } else if (distinctOtherStudents.size === 1) {
        totalScore += 30;
        riskSignals.push({
          signal: 'Device',
          status: 'FLAGGED',
          scoreContribution: 30,
          reason: `Duplicate device: Same physical device used to submit attendance for another student account today (Device suspicious ⚠️)`
        });
      } else {
        riskSignals.push({
          signal: 'Device',
          status: 'PASSED',
          scoreContribution: 0,
          reason: 'Unique device fingerprint bound to this student'
        });
      }
    } catch (err) {
      console.error('Error checking device fingerprint reuse:', err.message);
    }
  } else {
    riskSignals.push({
      signal: 'Device',
      status: 'PASSED',
      scoreContribution: 0,
      reason: 'No device fingerprint captured'
    });
  }

  // 5. SIGNAL 5: SUSPICIOUS IP ADDRESS CONCURRENCY
  const ip = deviceInfo.ipAddress;
  if (ip && ip !== '127.0.0.1' && ip !== '::1') {
    try {
      const windowStart = new Date(new Date(scanTimestamp).getTime() - 45000);
      const windowEnd = new Date(new Date(scanTimestamp).getTime() + 45000);

      const burstRecords = await Attendance.find({
        createdAt: { $gte: windowStart, $lte: windowEnd },
        student: { $ne: studentId },
        'deviceInfo.ipAddress': ip
      });

      const distinctIpStudents = new Set(burstRecords.map((r) => r.student.toString()));

      if (distinctIpStudents.size >= 2) {
        totalScore += 20;
        riskSignals.push({
          signal: 'IP',
          status: 'WARNING',
          scoreContribution: 20,
          reason: `Suspicious IP: IP address ${ip} used for ${distinctIpStudents.size + 1} concurrent student scans within 45 seconds`
        });
      } else {
        riskSignals.push({
          signal: 'IP',
          status: 'PASSED',
          scoreContribution: 0,
          reason: 'IP address scan pattern is normal'
        });
      }
    } catch (err) {
      console.error('Error checking IP address concurrency:', err.message);
    }
  } else {
    riskSignals.push({
      signal: 'IP',
      status: 'PASSED',
      scoreContribution: 0,
      reason: 'Local or standard IP address'
    });
  }

  // 6. SIGNAL 6: ATTENDANCE PATTERN & DEVICE SWITCH ANOMALY
  if (fingerprint && studentId) {
    try {
      const studentPastRecords = await Attendance.find({
        student: studentId,
        'deviceInfo.deviceFingerprint': { $exists: true, $ne: '' }
      })
        .sort({ createdAt: -1 })
        .limit(5);

      if (studentPastRecords.length >= 3) {
        const pastFingerprints = studentPastRecords.map(
          (r) => r.deviceInfo?.deviceFingerprint || r.deviceInfo?.browserId
        );
        const matchesPast = pastFingerprints.includes(fingerprint);

        if (!matchesPast) {
          totalScore += 15;
          riskSignals.push({
            signal: 'Pattern',
            status: 'WARNING',
            scoreContribution: 15,
            reason: 'Unfamiliar device fingerprint switch for this student'
          });
        } else {
          riskSignals.push({
            signal: 'Pattern',
            status: 'PASSED',
            scoreContribution: 0,
            reason: 'Device matches historical student profile'
          });
        }
      }
    } catch (err) {
      console.error('Error checking pattern anomaly:', err.message);
    }
  }

  // CLAMP TOTAL RISK SCORE (0 - 100)
  const riskScore = Math.min(100, Math.max(0, totalScore));

  // DETERMINE RISK LEVEL & REVIEW STATUS (Phase 22 3-Tier Threshold Matrix)
  // 0 - 30: Normal (Approved)
  // 31 - 60: Review (Pending)
  // 61 - 100: High Risk (Pending)
  let riskLevel = 'Normal';
  let reviewStatus = 'Approved';

  if (riskScore >= 61) {
    riskLevel = 'High Risk';
    reviewStatus = 'Pending';
  } else if (riskScore >= 30) {
    riskLevel = 'Review';
    reviewStatus = 'Pending';
  }

  return {
    riskScore,
    riskLevel,
    riskSignals,
    reviewStatus,
    isSuspicious: riskLevel !== 'Normal'
  };
}

module.exports = {
  evaluateAttendanceRisk,
  calculateHaversineDistance
};
