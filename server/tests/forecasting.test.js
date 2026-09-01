const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const Subject = require('../src/models/Subject');
const generateToken = require('../src/utils/generateToken');
const {
  calculateConsecutiveNeeded,
  calculateSafeMisses,
  calculateCanSkip,
  calculateMilestones,
  calculateAttendanceForecast
} = require('../src/utils/forecastingEngine');

describe('Phase 26: Attendance Forecasting Engine Tests 📈', () => {
  let studentUser;
  let studentToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Subject.deleteMany({});

    studentUser = await User.create({
      name: 'Elena Rostova',
      email: 'elena@student.edu',
      password: 'Password123!',
      role: 'student',
      rollNo: 'CS-2026-088',
      department: 'Computer Science & Engineering',
      course: 'B.Tech'
    });

    studentToken = generateToken(studentUser._id, studentUser.role);

    // Create enrolled subjects
    await Subject.create([
      { code: 'CS301', name: 'Database Systems', department: 'Computer Science & Engineering' },
      { code: 'CS302', name: 'Computer Networks', department: 'Computer Science & Engineering' }
    ]);

    // Create attendance: Database Systems = 17/25 (68%), Computer Networks = 17/20 (85%)
    const dbmsRecords = [];
    for (let i = 0; i < 25; i++) {
      dbmsRecords.push({
        student: studentUser._id,
        subject: 'Database Systems',
        subjectCode: 'CS301',
        date: new Date(2026, 7, i + 1),
        status: i < 17 ? 'Present' : 'Absent',
        markedBy: studentUser._id
      });
    }
    await Attendance.insertMany(dbmsRecords);

    const netRecords = [];
    for (let i = 0; i < 20; i++) {
      netRecords.push({
        student: studentUser._id,
        subject: 'Computer Networks',
        subjectCode: 'CS302',
        date: new Date(2026, 7, i + 1),
        status: i < 17 ? 'Present' : 'Absent',
        markedBy: studentUser._id
      });
    }
    await Attendance.insertMany(netRecords);
  });

  describe('1. Pure Mathematical Formula Unit Tests', () => {
    test('calculateConsecutiveNeeded: correctly computes recovery for 68% to reach 75%', () => {
      // P = 17, T = 25 (68%). ceil((0.75*25 - 17)/0.25) = ceil(1.75/0.25) = 7
      const needed = calculateConsecutiveNeeded({ attended: 17, total: 25, targetPercentage: 75 });
      expect(needed).toBe(7);

      // Verify mathematical proof: (17 + 7) / (25 + 7) = 24 / 32 = 0.75 (75.0%)
      expect((17 + 7) / (25 + 7)).toBe(0.75);
    });

    test('calculateConsecutiveNeeded: returns 0 when already >= target', () => {
      expect(calculateConsecutiveNeeded({ attended: 15, total: 20, targetPercentage: 75 })).toBe(0);
      expect(calculateConsecutiveNeeded({ attended: 18, total: 20, targetPercentage: 75 })).toBe(0);
    });

    test('calculateConsecutiveNeeded: handles 0 total classes gracefully', () => {
      expect(calculateConsecutiveNeeded({ attended: 0, total: 0, targetPercentage: 75 })).toBe(0);
    });

    test('calculateConsecutiveNeeded: handles custom target percentage (e.g. 80%, 85%)', () => {
      // P = 17, T = 25. Target 80%: ceil((0.8*25 - 17)/0.2) = ceil(3/0.2) = 15
      const needed80 = calculateConsecutiveNeeded({ attended: 17, total: 25, targetPercentage: 80 });
      expect(needed80).toBe(15);
      expect((17 + 15) / (25 + 15)).toBe(0.8);
    });

    test('calculateSafeMisses: correctly computes safe skips for 85% with 75% target', () => {
      // P = 17, T = 20 (85%). floor(17/0.75 - 20) = floor(22.67 - 20) = 2
      const safe = calculateSafeMisses({ attended: 17, total: 20, targetPercentage: 75 });
      expect(safe).toBe(2);

      // Verify proof: missing 2 classes -> 17/22 = 77.27% >= 75%
      expect(17 / (20 + 2)).toBeGreaterThanOrEqual(0.75);
      // Missing 3 classes -> 17/23 = 73.91% < 75%
      expect(17 / (20 + 3)).toBeLessThan(0.75);
    });

    test('calculateSafeMisses: returns 0 when attendance is below or exactly at target', () => {
      expect(calculateSafeMisses({ attended: 17, total: 25, targetPercentage: 75 })).toBe(0); // 68%
      expect(calculateSafeMisses({ attended: 15, total: 20, targetPercentage: 75 })).toBe(0); // 75% exactly
    });

    test('calculateCanSkip: evaluates scenario and projects percentage', () => {
      // 17/20 (85%). Propose skipping 1 class -> 17/21 = 80.95% (Safe)
      const safeScenario = calculateCanSkip({
        attended: 17,
        total: 20,
        skipCount: 1,
        attendCount: 0,
        targetPercentage: 75
      });
      expect(safeScenario.projected.canSkip).toBe(true);
      expect(safeScenario.projected.percentage).toBe(80.95);
      expect(safeScenario.projected.status).toBe('SAFE');

      // 17/20 (85%). Propose skipping 3 classes -> 17/23 = 73.91% (Deficit Warning)
      const dangerScenario = calculateCanSkip({
        attended: 17,
        total: 20,
        skipCount: 3,
        attendCount: 0,
        targetPercentage: 75
      });
      expect(dangerScenario.projected.canSkip).toBe(false);
      expect(dangerScenario.projected.percentage).toBe(73.91);
      expect(dangerScenario.projected.penaltyAfter).toBe(1); // Needs 1 lecture to recover to 75%
    });

    test('calculateMilestones: returns structured milestones for standard benchmarks', () => {
      const milestones = calculateMilestones({ attended: 17, total: 25 });
      expect(milestones).toHaveLength(5);
      expect(milestones[0].target).toBe(75);
      expect(milestones[0].consecutiveNeeded).toBe(7);
      expect(milestones[0].isMet).toBe(false);
    });
  });

  describe('2. POST /api/ai/forecast/calculate Endpoint', () => {
    test('should return complete forecast calculation for arbitrary parameters', async () => {
      const res = await request(app)
        .post('/api/ai/forecast/calculate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attended: 34,
          total: 50, // 68%
          targetPercentage: 75,
          futureClasses: 20,
          skipCount: 2,
          attendCount: 3,
          subject: 'Operating Systems'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subject).toBe('Operating Systems');
      expect(res.body.data.current.percentage).toBe(68);
      expect(res.body.data.metrics.consecutiveNeeded).toBe(14); // ceil((0.75*50 - 34)/0.25) = 14
      expect(res.body.data.canSkipAnalysis.projected.attended).toBe(37); // 34 + 3
      expect(res.body.data.canSkipAnalysis.projected.total).toBe(55); // 50 + 3 + 2
      expect(res.body.data.milestones).toHaveLength(5);
    });
  });

  describe('3. GET /api/ai/forecast/me Endpoint', () => {
    test('should return student-scoped multi-subject attendance forecast', async () => {
      const res = await request(app)
        .get('/api/ai/forecast/me?target=75&future=15')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student.name).toBe('Elena Rostova');
      expect(res.body.data.summary.totalSubjects).toBe(2);

      // Check Database Systems (68%)
      const dbms = res.body.data.subjects.find((s) => s.subject === 'Database Systems');
      expect(dbms).toBeDefined();
      expect(dbms.current.percentage).toBe(68);
      expect(dbms.metrics.consecutiveNeeded).toBe(7);
      expect(dbms.metrics.safeMisses).toBe(0);

      // Check Computer Networks (85%)
      const net = res.body.data.subjects.find((s) => s.subject === 'Computer Networks');
      expect(net).toBeDefined();
      expect(net.current.percentage).toBe(85);
      expect(net.metrics.safeMisses).toBe(2);
      expect(net.metrics.consecutiveNeeded).toBe(0);
    });
  });

  describe('4. AI Chatbot Forecasting Intents Integration', () => {
    test('should respond to "How many classes must I attend?" intent with recovery calculation', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ message: 'How many classes must I attend in Database Systems?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('HOW_MANY_MUST_I_ATTEND');
      expect(res.body.reply).toContain('7 consecutive lecture(s)');
      expect(res.body.cardData.type).toBe('must_attend_card');
      expect(res.body.cardData.consecutiveNeeded).toBe(7);
    });

    test('should respond to "How many classes can I miss?" intent with safe miss allowance', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ message: 'How many classes can I miss in Computer Networks?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('HOW_MANY_CAN_I_MISS');
      expect(res.body.reply).toContain('2 lecture(s)');
      expect(res.body.cardData.type).toBe('miss_allowance_card');
      expect(res.body.cardData.safeMisses).toBe(2);
    });

    test('should respond to "Can I skip 2 classes?" intent with scenario analysis', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ message: 'Can I skip 2 classes in Computer Networks?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('CAN_I_SKIP_SCENARIO');
      expect(res.body.reply).toContain('Yes, You Can Skip 2 Class(es)');
      expect(res.body.cardData.canSkip).toBe(true);
    });

    test('should respond to "Forecast my attendance" intent with complete forecast summary', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ message: 'Forecast my attendance' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('FORECAST_SUMMARY');
      expect(res.body.reply).toContain('Attendance Forecasting Engine Summary');
      expect(res.body.cardData.type).toBe('forecast_summary_card');
    });
  });
});
