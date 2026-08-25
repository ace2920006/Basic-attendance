const {
  DEFAULT_RULES,
  getSystemRules,
  invalidateRulesCache,
  evaluateCheckInStatus,
  calculateAttendanceStats
} = require('../src/utils/attendanceRulesEngine');

describe('Phase 19: Advanced Attendance Rules Engine Tests', () => {
  beforeEach(() => {
    invalidateRulesCache();
  });

  describe('Default System Rules & Cache', () => {
    test('should return default system rules when no DB rules are loaded', async () => {
      const rules = await getSystemRules();
      expect(rules).toBeDefined();
      expect(rules.minAttendancePercentage).toBe(75);
      expect(rules.lateThresholdMinutes).toBe(10);
      expect(rules.gracePeriodMinutes).toBe(5);
      expect(rules.qrValidityMinutes).toBe(1);
      expect(rules.gpsRadiusMeters).toBe(100);
      expect(rules.statusConfigs).toHaveLength(7);
    });
  });

  describe('Check-In Evaluation Sandbox', () => {
    const rules = {
      minAttendancePercentage: 75,
      lateThresholdMinutes: 10,
      gracePeriodMinutes: 5,
      qrValidityMinutes: 1,
      gpsRadiusMeters: 100,
      statusConfigs: DEFAULT_RULES.statusConfigs
    };

    test('should evaluate check-in within grace period as Present', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 3 * 60 * 1000).toISOString(); // 3 mins ago

      const result = evaluateCheckInStatus({
        classStartTime: startTime,
        checkInTime: now.toISOString(),
        gpsDistance: 50,
        qrTimestamp: now.toISOString(),
        rules
      });

      expect(result.isValid).toBe(true);
      expect(result.status).toBe('Present');
      expect(result.isWithinGracePeriod).toBe(true);
    });

    test('should evaluate check-in past grace period but within late cutoff as Late', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 7 * 60 * 1000).toISOString(); // 7 mins ago

      const result = evaluateCheckInStatus({
        classStartTime: startTime,
        checkInTime: now.toISOString(),
        gpsDistance: 20,
        qrTimestamp: now.toISOString(),
        rules
      });

      expect(result.isValid).toBe(true);
      expect(result.status).toBe('Late');
      expect(result.isWithinGracePeriod).toBe(false);
      expect(result.isWithinLateThreshold).toBe(true);
    });

    test('should evaluate check-in past late threshold cutoff as Absent', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 15 * 60 * 1000).toISOString(); // 15 mins ago

      const result = evaluateCheckInStatus({
        classStartTime: startTime,
        checkInTime: now.toISOString(),
        gpsDistance: 10,
        qrTimestamp: now.toISOString(),
        rules
      });

      expect(result.isValid).toBe(true);
      expect(result.status).toBe('Absent');
      expect(result.isWithinLateThreshold).toBe(false);
    });

    test('should flag expired QR code as invalid and Absent', () => {
      const now = new Date();
      const startTime = now.toISOString();
      const oldQrTime = new Date(now.getTime() - 120 * 1000).toISOString(); // 120s old (limit 60s)

      const result = evaluateCheckInStatus({
        classStartTime: startTime,
        checkInTime: now.toISOString(),
        gpsDistance: 10,
        qrTimestamp: oldQrTime,
        rules
      });

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('EXPIRED_QR');
      expect(result.status).toBe('Absent');
    });

    test('should flag out of bounds GPS distance as invalid and Absent', () => {
      const now = new Date();
      const startTime = now.toISOString();

      const result = evaluateCheckInStatus({
        classStartTime: startTime,
        checkInTime: now.toISOString(),
        gpsDistance: 250, // 250m (allowed radius 100m)
        qrTimestamp: now.toISOString(),
        rules
      });

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('OUT_OF_BOUNDS');
      expect(result.status).toBe('Absent');
    });
  });

  describe('7-Status Attendance Calculations', () => {
    test('should correctly compute weighted attendance percentage and exclude Holiday/Cancelled from denominator', () => {
      const records = [
        { status: 'Present' }, // +1.0 attended, +1 conducted
        { status: 'Present' }, // +1.0 attended, +1 conducted
        { status: 'Late' },    // +0.8 weighted, +1 conducted
        { status: 'Absent' },  // +0.0 attended, +1 conducted
        { status: 'Excused' }, // +1.0 attended, +1 conducted
        { status: 'Holiday' }, // Excluded from conducted
        { status: 'Cancelled Lecture' } // Excluded from conducted
      ];

      const stats = calculateAttendanceStats(records, DEFAULT_RULES);

      expect(stats.totalRecords).toBe(7);
      expect(stats.totalConducted).toBe(5); // Present(2) + Late(1) + Absent(1) + Excused(1)
      expect(stats.totalAttended).toBe(4);  // Present(2) + Late(1) + Excused(1)
      expect(stats.weightedScore).toBe(3.8); // 1 + 1 + 0.8 + 0 + 1 = 3.8
      expect(stats.weightedPercentage).toBe(76); // (3.8 / 5) * 100 = 76%
      expect(stats.isEligible).toBe(true);
    });
  });
});
