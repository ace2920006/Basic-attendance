const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Class = require('../src/models/Class');
const AttendanceSession = require('../src/models/AttendanceSession');
const Attendance = require('../src/models/Attendance');

describe('Phase 20: Attendance Session Engine Tests', () => {
  let teacherToken;
  let studentToken;
  let teacherUser;
  let studentUser;
  let testClass;

  beforeEach(async () => {
    await User.deleteMany({});
    await Class.deleteMany({});
    await AttendanceSession.deleteMany({});
    await Attendance.deleteMany({});

    // Create teacher
    const teacherRes = await request(app).post('/api/auth/register').send({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@university.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science'
    });
    teacherToken = teacherRes.body.data.accessToken;
    teacherUser = teacherRes.body.data;

    // Create student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Alex Rivera',
      email: 'alex.rivera@student.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2026-042',
      department: 'Computer Science'
    });
    studentToken = studentRes.body.data.accessToken;
    studentUser = studentRes.body.data;

    // Create scheduled class
    testClass = await Class.create({
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS201',
      section: 'IT-A',
      room: 'Lab 302',
      timeSlot: '10:00 AM - 11:00 AM',
      department: 'Computer Science',
      instructor: teacherUser.name,
      instructorId: teacherUser._id,
      studentsCount: 35
    });
  });

  describe('Session Lifecycle Management', () => {
    test('POST /api/sessions/start should create a new AttendanceSession with unique Session ID', async () => {
      const res = await request(app)
        .post('/api/sessions/start')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          classId: testClass._id,
          mode: 'QR',
          latitude: 28.6139,
          longitude: 77.2090,
          maxRadiusMeters: 150
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.sessionId).toMatch(/^SESS-/);
      expect(res.body.data.subjectCode).toBe('CS201');
      expect(res.body.data.division).toBe('IT-A');
      expect(res.body.data.status).toBe('Active');
      expect(res.body.data.startTime).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.data.campusLocation.maxRadiusMeters).toBe(150);
    });

    test('GET /api/sessions/active should return current active session for class', async () => {
      // Start session first
      const startRes = await request(app)
        .post('/api/sessions/start')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ classId: testClass._id, mode: 'QR' });

      const activeRes = await request(app)
        .get(`/api/sessions/active?classId=${testClass._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(activeRes.statusCode).toBe(200);
      expect(activeRes.body.active).toBe(true);
      expect(activeRes.body.data.sessionId).toBe(startRes.body.data.sessionId);
    });

    test('POST /api/attendance/scan-qr should record student attendance and link sessionId', async () => {
      // Start session to obtain token
      const startRes = await request(app)
        .post('/api/sessions/start')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ classId: testClass._id, mode: 'QR', latitude: 28.6139, longitude: 77.2090 });

      const qrToken = startRes.body.token;

      // Student scans QR code
      const scanRes = await request(app)
        .post('/api/attendance/scan-qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          qrToken,
          latitude: 28.6139,
          longitude: 77.2090,
          browserId: 'browser-test-123',
          deviceFingerprint: 'fp-test-123'
        });

      expect(scanRes.statusCode).toBe(201);
      expect(scanRes.body.success).toBe(true);
      expect(scanRes.body.data.status).toBe('Present');
      expect(scanRes.body.data.sessionId.toString()).toBe(startRes.body.data._id.toString());
    });

    test('POST /api/sessions/:id/stop should set session status to Completed and record endTime', async () => {
      // Start session
      const startRes = await request(app)
        .post('/api/sessions/start')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ classId: testClass._id });

      const sessionId = startRes.body.data._id;

      // Stop session
      const stopRes = await request(app)
        .post(`/api/sessions/${sessionId}/stop`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(stopRes.statusCode).toBe(200);
      expect(stopRes.body.data.status).toBe('Completed');
      expect(stopRes.body.data.endTime).toBeDefined();
    });
  });
});
