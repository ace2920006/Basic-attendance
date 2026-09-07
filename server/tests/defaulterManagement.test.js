const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const AttendanceRule = require('../src/models/AttendanceRule');
const DefaulterRecord = require('../src/models/DefaulterRecord');
const { generateAccessToken } = require('../src/utils/generateToken');
const {
  DEFAULT_DEFAULTER_THRESHOLDS,
  classifyDefaulterTier,
  calculateClassesNeeded,
  evaluateStudentDefaulter,
  evaluateAllDefaulters
} = require('../src/services/defaulterService');

describe('🚨 Phase 30: Automated Defaulter Management Test Suite', () => {
  let adminToken, adminUser;
  let teacherToken, teacherUser;
  let studentToken, studentUser;

  beforeEach(async () => {
    // 1. Clean collections
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await AttendanceRule.deleteMany({});
    await DefaulterRecord.deleteMany({});

    // 2. Create Admin
    adminUser = await User.create({
      name: 'Dean Eleanor Vance',
      email: 'dean.vance@university.edu',
      password: 'password123',
      role: 'admin',
      department: 'Computer Science & Engineering'
    });
    adminToken = generateAccessToken(adminUser._id, 'admin');

    // 3. Create Teacher
    teacherUser = await User.create({
      name: 'Prof. Alan Turing',
      email: 'alan.turing@university.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science & Engineering'
    });
    teacherToken = generateAccessToken(teacherUser._id, 'teacher');

    // 4. Create Student with registered Parent/Guardian contact
    studentUser = await User.create({
      name: 'Alex Mercer',
      email: 'alex.mercer@university.edu',
      password: 'password123',
      role: 'student',
      rollNo: '2026-CS-101',
      department: 'Computer Science & Engineering',
      divisionName: 'CSE-A',
      guardianName: 'Arthur Mercer',
      guardianEmail: 'arthur.mercer@parent-domain.org',
      guardianPhone: '+1-555-0199',
      guardianRelation: 'Father'
    });
    studentToken = generateAccessToken(studentUser._id, 'student');
  });

  describe('🧠 1. Unit: Defaulter Escalation Tiers & Mathematical Recovery', () => {
    it('should classify default escalation tiers accurately (<75% Warning, <70% Serious, <65% Admin, <60% Parent)', () => {
      // Safe (>= 75%)
      const safe = classifyDefaulterTier(76);
      expect(safe.isDefaulter).toBe(false);
      expect(safe.tier).toBeNull();

      // Tier 1: Warning (<75% and >=70%)
      const tier1 = classifyDefaulterTier(72.5);
      expect(tier1.isDefaulter).toBe(true);
      expect(tier1.tier).toBe('WARNING');
      expect(tier1.tierLabel).toContain('75');

      // Tier 2: Serious Warning (<70% and >=65%)
      const tier2 = classifyDefaulterTier(68.0);
      expect(tier2.isDefaulter).toBe(true);
      expect(tier2.tier).toBe('SERIOUS_WARNING');
      expect(tier2.tierLabel).toContain('70');

      // Tier 3: Admin Alert (<65% and >=60%)
      const tier3 = classifyDefaulterTier(62.0);
      expect(tier3.isDefaulter).toBe(true);
      expect(tier3.tier).toBe('ADMIN_ALERT');
      expect(tier3.tierLabel).toContain('65');

      // Tier 4: Parent/Guardian Alert (<60%)
      const tier4 = classifyDefaulterTier(55.0);
      expect(tier4.isDefaulter).toBe(true);
      expect(tier4.tier).toBe('PARENT_ALERT');
      expect(tier4.tierLabel).toContain('60');
    });

    it('should respect custom, user-configured escalation thresholds', () => {
      const customConfig = {
        warningThreshold: 80,
        seriousWarningThreshold: 75,
        adminAlertThreshold: 70,
        parentAlertThreshold: 65
      };

      // 78% was Safe in default, but is Warning in custom (<80%)
      const customTier1 = classifyDefaulterTier(78, customConfig);
      expect(customTier1.tier).toBe('WARNING');

      // 73% is Serious Warning in custom (<75%)
      const customTier2 = classifyDefaulterTier(73, customConfig);
      expect(customTier2.tier).toBe('SERIOUS_WARNING');

      // 68% is Admin Alert in custom (<70%)
      const customTier3 = classifyDefaulterTier(68, customConfig);
      expect(customTier3.tier).toBe('ADMIN_ALERT');

      // 62% is Parent Alert in custom (<65%)
      const customTier4 = classifyDefaulterTier(62, customConfig);
      expect(customTier4.tier).toBe('PARENT_ALERT');
    });

    it('should compute deficit classes needed using recovery formula x = ceil((rT - P)/(1-r))', () => {
      // 5 attended out of 10 conducted = 50%.
      // Formula: ceil((0.75 * 10 - 5) / 0.25) = ceil(2.5 / 0.25) = 10 classes
      // Check: (5 + 10) / (10 + 10) = 15 / 20 = 75%
      const needed = calculateClassesNeeded(5, 10, 75);
      expect(needed).toBe(10);

      // Already above target (8 attended out of 10 = 80% > 75%)
      const zeroNeeded = calculateClassesNeeded(8, 10, 75);
      expect(zeroNeeded).toBe(0);
    });
  });

  describe('⚙️ 2. Configuration Management: Configurable Thresholds API', () => {
    it('should retrieve default defaulter configuration', async () => {
      const res = await request(app)
        .get('/api/defaulters/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.warningThreshold).toBe(75);
      expect(res.body.data.seriousWarningThreshold).toBe(70);
      expect(res.body.data.adminAlertThreshold).toBe(65);
      expect(res.body.data.parentAlertThreshold).toBe(60);
    });

    it('should allow admin to update configurable thresholds', async () => {
      const updatedConfig = {
        warningThreshold: 80,
        seriousWarningThreshold: 75,
        adminAlertThreshold: 70,
        parentAlertThreshold: 65,
        sendParentEmail: true
      };

      const res = await request(app)
        .put('/api/defaulters/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedConfig);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.warningThreshold).toBe(80);
      expect(res.body.data.seriousWarningThreshold).toBe(75);
      expect(res.body.data.adminAlertThreshold).toBe(70);
      expect(res.body.data.parentAlertThreshold).toBe(65);
    });

    it('should reject non-admin users from updating thresholds (403 Forbidden)', async () => {
      const res = await request(app)
        .put('/api/defaulters/config')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ warningThreshold: 80 });

      expect(res.status).toBe(403);
    });

    it('should reject invalid escalation hierarchy (e.g. Warning < Serious)', async () => {
      const invalidConfig = {
        warningThreshold: 60,
        seriousWarningThreshold: 75,
        adminAlertThreshold: 70,
        parentAlertThreshold: 65
      };

      const res = await request(app)
        .put('/api/defaulters/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidConfig);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('hierarchy violation');
    });
  });

  describe('🔍 3. Automated Defaulter Evaluation & Escalation Flow', () => {
    it('should automatically identify student below 60% and escalate to PARENT_ALERT', async () => {
      // Create 10 attendance records: 4 Present, 6 Absent => 40% (<60%)
      const dates = [
        new Date(2026, 8, 1),
        new Date(2026, 8, 2),
        new Date(2026, 8, 3),
        new Date(2026, 8, 4),
        new Date(2026, 8, 5),
        new Date(2026, 8, 6),
        new Date(2026, 8, 7),
        new Date(2026, 8, 8),
        new Date(2026, 8, 9),
        new Date(2026, 8, 10)
      ];

      for (let i = 0; i < 10; i++) {
        await Attendance.create({
          student: studentUser._id,
          subject: 'Distributed Systems',
          status: i < 4 ? 'Present' : 'Absent',
          date: dates[i],
          markedBy: teacherUser._id
        });
      }

      // Trigger student evaluation
      const evalRes = await evaluateStudentDefaulter(studentUser._id);

      expect(evalRes.evaluated).toBe(true);
      expect(evalRes.isDefaulter).toBe(true);
      expect(evalRes.tier).toBe('PARENT_ALERT');
      expect(evalRes.attendancePercentage).toBe(40.0);
      expect(evalRes.classesNeeded).toBeGreaterThan(0);

      // Verify DefaulterRecord in DB
      const record = await DefaulterRecord.findOne({ student: studentUser._id, status: 'active' });
      expect(record).toBeDefined();
      expect(record.tier).toBe('PARENT_ALERT');
      expect(record.guardianEmail).toBe('arthur.mercer@parent-domain.org');
      expect(record.parentNotified).toBe(true);
      expect(record.escalationHistory.length).toBeGreaterThan(0);
    });

    it('should clear defaulter status when student attendance recovers >= 75%', async () => {
      // 1. First make student a defaulter with 5 classes (1 Present, 4 Absent = 20%)
      for (let i = 0; i < 5; i++) {
        await Attendance.create({
          student: studentUser._id,
          subject: 'Operating Systems',
          status: i === 0 ? 'Present' : 'Absent',
          date: new Date(2026, 8, i + 1),
          markedBy: teacherUser._id
        });
      }
      await evaluateStudentDefaulter(studentUser._id);

      let record = await DefaulterRecord.findOne({ student: studentUser._id, status: 'active' });
      expect(record).toBeDefined();
      expect(record.status).toBe('active');

      // 2. Now add 20 consecutive Present classes => 21/25 = 84% (>=75%)
      for (let i = 5; i < 25; i++) {
        await Attendance.create({
          student: studentUser._id,
          subject: 'Operating Systems',
          status: 'Present',
          date: new Date(2026, 8, i + 1),
          markedBy: teacherUser._id
        });
      }

      const recoveredEval = await evaluateStudentDefaulter(studentUser._id);
      expect(recoveredEval.isDefaulter).toBe(false);
      expect(recoveredEval.attendancePercentage).toBeGreaterThanOrEqual(75);

      // Record in DB should now be marked resolved
      const resolvedRecord = await DefaulterRecord.findById(record._id);
      expect(resolvedRecord.status).toBe('resolved');
      expect(resolvedRecord.resolvedAt).toBeDefined();
    });
  });

  describe('📋 4. Defaulter Management API & Roster Endpoints', () => {
    beforeEach(async () => {
      // Populate a defaulter record
      await DefaulterRecord.create({
        student: studentUser._id,
        studentName: studentUser.name,
        studentRollNo: studentUser.rollNo,
        studentEmail: studentUser.email,
        department: studentUser.department,
        division: studentUser.divisionName,
        guardianName: studentUser.guardianName,
        guardianEmail: studentUser.guardianEmail,
        guardianPhone: studentUser.guardianPhone,
        attendancePercentage: 58.5,
        attendedClasses: 12,
        totalClasses: 21,
        classesNeededToTarget: 15,
        targetPercentage: 75,
        tier: 'PARENT_ALERT',
        tierLabel: 'Parent Alert (<60%)',
        status: 'active',
        parentNotified: true,
        escalationHistory: [
          {
            tier: 'PARENT_ALERT',
            actionSummary: 'Parent notice dispatched',
            channels: ['in_app', 'email'],
            recipients: ['arthur.mercer@parent-domain.org'],
            status: 'DISPATCHED'
          }
        ]
      });
    });

    it('should list defaulters with tier and department filters (GET /api/defaulters)', async () => {
      const res = await request(app)
        .get('/api/defaulters?tier=PARENT_ALERT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].tier).toBe('PARENT_ALERT');
      expect(res.body.data[0].studentName).toBe('Alex Mercer');
    });

    it('should return executive summary metrics (GET /api/defaulters/summary)', async () => {
      const res = await request(app)
        .get('/api/defaulters/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalActiveDefaulters).toBe(1);
      expect(res.body.data.byTier.parentAlert.count).toBe(1);
      expect(res.body.data.byTier.parentAlert.threshold).toBe(60);
    });

    it('should allow student to query own defaulter status (GET /api/defaulters/student/:id)', async () => {
      const res = await request(app)
        .get(`/api/defaulters/student/${studentUser._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isDefaulter).toBe(true);
      expect(res.body.data.currentRecord.attendancePercentage).toBe(58.5);
    });

    it('should allow admin to resolve a defaulter record manually (POST /api/defaulters/:id/resolve)', async () => {
      const record = await DefaulterRecord.findOne({ student: studentUser._id });

      const res = await request(app)
        .post(`/api/defaulters/${record._id}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Medical certificate submitted and verified by HOD' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.resolutionNotes).toContain('Medical certificate');
    });

    it('should execute batch evaluation across the entire college (POST /api/defaulters/evaluate)', async () => {
      const res = await request(app)
        .post('/api/defaulters/evaluate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ department: 'all', forceNotify: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStudents).toBeGreaterThan(0);
    });
  });
});
