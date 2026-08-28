const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const Class = require('../src/models/Class');
const Attendance = require('../src/models/Attendance');
const { evaluateAttendanceRisk } = require('../src/utils/antiProxyEngine');

const User = require('../src/models/User');
const { generateAccessToken } = require('../src/utils/generateToken');

describe('🛡️ Phase 21: Anti-Proxy Attendance System Test Suite', () => {
  let studentToken, studentUser, teacherToken, teacherUser, mockClass;

  beforeEach(async () => {
    // Provision Teacher
    teacherUser = await User.create({
      name: 'Prof. Shield Guard',
      email: 'prof.shield@example.com',
      password: 'password123',
      role: 'teacher'
    });
    teacherToken = generateAccessToken(teacherUser._id, teacherUser.role);

    // Register Student 1 (Alice)
    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Student',
      email: 'alice.antiproxy@example.com',
      password: 'password123',
      role: 'student',
      rollNo: 'CS202610'
    });
    studentToken = sRes.body.data.accessToken;
    studentUser = sRes.body.data;

    // Create Class with campus location
    mockClass = await Class.create({
      subject: 'Cyber Security & Fraud',
      subjectCode: 'CS501',
      instructorId: teacherUser._id,
      instructorName: teacherUser.name,
      room: 'Security Lab 1',
      timeSlot: '10:00 AM - 11:00 AM',
      date: new Date(),
      qrActive: true,
      campusLocation: {
        latitude: 28.6139,
        longitude: 77.2090,
        maxRadiusMeters: 500
      }
    });
  });

  describe('Multi-Signal Risk Engine Utility (evaluateAttendanceRisk)', () => {
    it('should compute Normal Risk Score (0) for valid on-campus scan with unique device', async () => {
      const risk = await evaluateAttendanceRisk({
        studentId: studentUser._id,
        subjectCode: 'CS501',
        qrTokenValid: true,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          distanceMeters: 50,
          maxRadiusMeters: 500,
          isWithinBounds: true
        },
        deviceInfo: {
          deviceFingerprint: 'alice_unique_device_99',
          browserId: 'browser_alice',
          ipAddress: '192.168.1.100'
        }
      });

      expect(risk.riskScore).toBeLessThanOrEqual(30);
      expect(risk.riskLevel).toBe('Normal');
      expect(risk.reviewStatus).toBe('Approved');
      expect(risk.isSuspicious).toBe(false);
    });

    it('should calculate exact signal weights: Invalid QR (+50), Wrong GPS (+40), Duplicate Device (+30), Suspicious IP (+20), Unusual Timing (+10)', async () => {
      // Test Invalid QR (+50) -> High Risk (>60)
      const qrRisk = await evaluateAttendanceRisk({
        studentId: studentUser._id,
        qrTokenValid: false,
        location: { isWithinBounds: true }
      });
      const qrSignal = qrRisk.riskSignals.find((s) => s.signal === 'QR Token');
      expect(qrSignal.scoreContribution).toBe(50);

      // Test Wrong GPS (+40) -> Review tier (31-60)
      const gpsRisk = await evaluateAttendanceRisk({
        studentId: studentUser._id,
        qrTokenValid: true,
        location: {
          latitude: 28.69,
          longitude: 77.3,
          distanceMeters: 1200,
          maxRadiusMeters: 500,
          isWithinBounds: false
        }
      });
      const gpsSignal = gpsRisk.riskSignals.find((s) => s.signal === 'GPS');
      expect(gpsSignal.scoreContribution).toBe(40);
      expect(gpsRisk.riskLevel).toBe('Review');
      expect(gpsRisk.reviewStatus).toBe('Pending');
    });

    it('should classify score 31-60 as Review and 61-100 as High Risk', async () => {
      // Create duplicate device scan to trigger +30 Duplicate Device
      await Attendance.create({
        student: teacherUser._id,
        subject: 'Cyber Security',
        subjectCode: 'CS501',
        status: 'Present',
        date: new Date(),
        deviceInfo: { deviceFingerprint: 'shared_device_222' }
      });

      const risk30 = await evaluateAttendanceRisk({
        studentId: studentUser._id,
        qrTokenValid: true,
        location: { isWithinBounds: true },
        deviceInfo: { deviceFingerprint: 'shared_device_222' }
      });
      expect(risk30.riskScore).toBe(30);
      expect(risk30.riskLevel).toBe('Normal');

      const risk70 = await evaluateAttendanceRisk({
        studentId: studentUser._id,
        qrTokenValid: false, // +50
        location: { isWithinBounds: true },
        deviceInfo: { deviceFingerprint: 'shared_device_222' } // +30
      });
      expect(risk70.riskScore).toBe(80);
      expect(risk70.riskLevel).toBe('High Risk');
      expect(risk70.reviewStatus).toBe('Pending');
    });
  });

  describe('QR Attendance Scan with Anti-Proxy Flagging', () => {
    it('should record attendance with Pending review status when suspicious signals are present', async () => {
      // Register second student
      const s2Res = await request(app).post('/api/auth/register').send({
        name: 'Bob Proxy Student',
        email: 'bob.proxy@example.com',
        password: 'password123',
        role: 'student',
        rollNo: 'CS202611'
      });
      const bobUser = s2Res.body.data;

      // Seed Alice's attendance with device fingerprint
      await Attendance.create({
        student: studentUser._id,
        subject: mockClass.subject,
        subjectCode: mockClass.subjectCode,
        status: 'Present',
        date: new Date(),
        deviceInfo: {
          deviceFingerprint: 'device_shared_777'
        }
      });

      const qrToken = jwt.sign(
        {
          classId: mockClass._id.toString(),
          subject: mockClass.subject,
          subjectCode: mockClass.subjectCode,
          timestamp: Date.now()
        },
        process.env.JWT_SECRET,
        { expiresIn: '30s' }
      );

      // Bob scans using same device fingerprint
      const res = await request(app)
        .post('/api/attendance/scan-qr')
        .set('Authorization', `Bearer ${s2Res.body.data.accessToken}`)
        .send({
          qrToken,
          latitude: 28.6139,
          longitude: 77.2090,
          deviceFingerprint: 'device_shared_777'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.isSuspicious).toBe(true);
      expect(res.body.reviewStatus).toBe('Pending');
      expect(res.body.data.riskScore).toBeGreaterThanOrEqual(30);
    });
  });

  describe('Teacher & Admin Review Console APIs (/api/anti-proxy)', () => {
    let flaggedRecord;

    beforeEach(async () => {
      flaggedRecord = await Attendance.create({
        student: studentUser._id,
        subject: mockClass.subject,
        subjectCode: mockClass.subjectCode,
        status: 'Present',
        date: new Date(),
        verificationMethod: 'QR',
        classId: mockClass._id,
        riskScore: 80,
        riskLevel: 'High Risk',
        reviewStatus: 'Pending',
        riskSignals: [
          { signal: 'GPS', status: 'FLAGGED', scoreContribution: 50, reason: '1,200m outside boundary' },
          { signal: 'Device', status: 'FLAGGED', scoreContribution: 45, reason: 'Shared device fingerprint' }
        ]
      });
    });

    it('should list flagged attendance records for instructor', async () => {
      const res = await request(app)
        .get('/api/anti-proxy/flagged')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.summary.totalPending).toBeGreaterThan(0);
    });

    it('should allow teacher to approve a flagged record', async () => {
      const res = await request(app)
        .put(`/api/anti-proxy/review/${flaggedRecord._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          action: 'approve',
          notes: 'Verified student was in lab room'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewStatus).toBe('Approved');
      expect(res.body.data.reviewNotes).toMatch(/Verified student/i);
    });

    it('should allow teacher to reject a flagged record (mark as Absent)', async () => {
      const res = await request(app)
        .put(`/api/anti-proxy/review/${flaggedRecord._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          action: 'reject',
          notes: 'Confirmed proxy scan from dormitory'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewStatus).toBe('Rejected');
      expect(res.body.data.status).toBe('Absent');
    });

    it('should fetch anti-proxy multi-signal analytics summary', async () => {
      const res = await request(app)
        .get('/api/anti-proxy/analytics')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.signalBreakdown).toHaveProperty('GPS');
      expect(res.body.data.riskLevelDistribution).toHaveProperty('highRisk');
    });

    it('should fetch multi-account device sharing clusters', async () => {
      const res = await request(app)
        .get('/api/anti-proxy/device-clusters')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
