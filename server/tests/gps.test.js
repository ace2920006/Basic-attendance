const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const Class = require('../src/models/Class');
const { getDistanceInMeters } = require('../src/utils/geoUtils');

describe('📍 GPS Geofencing Test Suite', () => {
  let studentToken, studentUser, teacherToken, teacherUser, mockClass;

  beforeEach(async () => {
    // Register Teacher
    const tRes = await request(app).post('/api/auth/register').send({
      name: 'Prof. GPS Guard',
      email: 'prof.gps@example.com',
      password: 'password123',
      role: 'teacher'
    });
    teacherToken = tRes.body.data.accessToken;
    teacherUser = tRes.body.data;

    // Register Student
    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Charlie GPS Student',
      email: 'charlie@example.com',
      password: 'password123',
      role: 'student',
      rollNo: 'CS202605'
    });
    studentToken = sRes.body.data.accessToken;
    studentUser = sRes.body.data;

    // Create Class with 500m Campus Geofence boundary
    mockClass = await Class.create({
      subject: 'Mobile Computing',
      subjectCode: 'CS401',
      instructorId: teacherUser._id,
      instructorName: teacherUser.name,
      room: 'Auditorium A',
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

  describe('Haversine Formula Utility Unit Tests', () => {
    it('should calculate 0 meters distance for identical coordinates', () => {
      const dist = getDistanceInMeters(28.6139, 77.2090, 28.6139, 77.2090);
      expect(Math.round(dist)).toBe(0);
    });

    it('should return Infinity if any coordinate parameter is undefined', () => {
      const dist = getDistanceInMeters(undefined, 77.2090, 28.6139, 77.2090);
      expect(dist).toBe(Infinity);
    });

    it('should calculate accurate distance in meters between two geographical points', () => {
      const dist = getDistanceInMeters(28.6139, 77.2090, 28.6148, 77.2090);
      expect(dist).toBeGreaterThan(90);
      expect(dist).toBeLessThan(110);
    });
  });

  describe('Geofence Boundary Enforcement on Attendance Marking', () => {
    it('should ACCEPT attendance when student is within 500m campus boundary', async () => {
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
          latitude: 28.6148,
          longitude: 77.2090,
          deviceFingerprint: 'charlie_gps_device_001'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.location.isWithinBounds).toBe(true);
      expect(res.body.data.location.distanceMeters).toBeLessThan(500);
    });

    it('should REJECT attendance when student is outside 500m campus boundary (> 500m)', async () => {
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
          latitude: 28.6562,
          longitude: 77.2410,
          deviceFingerprint: 'charlie_gps_device_002'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/GPS Verification Failed/i);
      expect(res.body.message).toMatch(/away from campus bounds/i);
    });
  });
});
