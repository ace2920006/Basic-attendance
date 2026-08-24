const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const Class = require('../src/models/Class');
const Attendance = require('../src/models/Attendance');

describe('📱 QR Code & Anti-Proxy Test Suite', () => {
  let studentToken, studentUser, teacherToken, teacherUser, mockClass;

  beforeEach(async () => {
    // Register Teacher
    const tRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. Davis',
      email: 'prof.davis@example.com',
      password: 'password123',
      role: 'teacher'
    });
    teacherToken = tRes.body.data.accessToken;
    teacherUser = tRes.body.data;

    // Register Student
    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Student',
      email: 'alice@example.com',
      password: 'password123',
      role: 'student',
      rollNo: 'CS202603'
    });
    studentToken = sRes.body.data.accessToken;
    studentUser = sRes.body.data;

    // Create active class session for QR scanning
    mockClass = await Class.create({
      subject: 'Computer Networks',
      subjectCode: 'CS302',
      instructorId: teacherUser._id,
      instructorName: teacherUser.name,
      room: 'Lab 4',
      timeSlot: '09:00 AM - 10:00 AM',
      date: new Date(),
      qrActive: true,
      campusLocation: {
        latitude: 28.6139,
        longitude: 77.2090,
        maxRadiusMeters: 500
      }
    });
  });

  describe('QR Token Signature & Expiration', () => {
    it('should verify valid 30-second QR token signature', () => {
      const payload = {
        classId: mockClass._id.toString(),
        subject: mockClass.subject,
        subjectCode: mockClass.subjectCode,
        timestamp: Date.now()
      };

      const qrToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30s'
      });

      const decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
      expect(decoded.classId).toBe(mockClass._id.toString());
      expect(decoded.subjectCode).toBe('CS302');
    });

    it('should reject expired QR tokens (> 30s timeout)', async () => {
      const payload = {
        classId: mockClass._id.toString(),
        subject: mockClass.subject,
        subjectCode: mockClass.subjectCode,
        timestamp: Date.now() - 40000
      };

      const expiredQrToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '-1s'
      });

      const res = await request(app)
        .post('/api/attendance/scan-qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrToken: expiredQrToken,
          latitude: 28.6139,
          longitude: 77.2090,
          deviceFingerprint: 'device_fingerprint_001'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/expired or invalid qr code/i);
    });
  });

  describe('POST /api/attendance/scan-qr (QR Attendance Marking)', () => {
    it('should successfully record attendance via valid QR code', async () => {
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

      const res = await request(app)
        .post('/api/attendance/scan-qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrToken,
          latitude: 28.6139,
          longitude: 77.2090,
          deviceFingerprint: 'alice_device_001',
          browserId: 'browser_id_alice'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationMethod).toBe('QR');
      expect(res.body.data.status).toBe('Present');
    });

    it('should prevent proxy attendance when same device attempts scan for second student', async () => {
      // Register second student
      const s2Res = await request(app).post('/api/auth/register').send({
        name: 'Bob Proxy Student',
        email: 'bob@example.com',
        password: 'password123',
        role: 'student',
        rollNo: 'CS202604'
      });
      const bobToken = s2Res.body.data.accessToken;
      const bobUser = s2Res.body.data;

      // Alice scans first with device_fingerprint_shared
      await Attendance.create({
        student: studentUser._id,
        subject: mockClass.subject,
        subjectCode: mockClass.subjectCode,
        status: 'Present',
        date: new Date(),
        deviceInfo: {
          deviceFingerprint: 'shared_device_fingerprint_999'
        }
      });

      // Bob tries to scan using the SAME device fingerprint
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

      const res = await request(app)
        .post('/api/attendance/scan-qr')
        .set('Authorization', `Bearer ${bobToken}`)
        .send({
          qrToken,
          latitude: 28.6139,
          longitude: 77.2090,
          deviceFingerprint: 'shared_device_fingerprint_999'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/proxy attendance detected/i);
    });
  });
});
