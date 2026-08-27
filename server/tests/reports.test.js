const request = require('supertest');
const app = require('../src/app');
const Attendance = require('../src/models/Attendance');

const User = require('../src/models/User');
const { generateAccessToken } = require('../src/utils/generateToken');

describe('📊 Reports Module Test Suite', () => {
  let adminToken, studentToken, studentUser, teacherToken;

  beforeEach(async () => {
    // Admin
    const adminUser = await User.create({
      name: 'Admin Director',
      email: 'admin.director@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = generateAccessToken(adminUser._id, adminUser.role);

    // Student
    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Report Student',
      email: 'report.student@example.com',
      password: 'password123',
      role: 'student',
      rollNo: 'CS202606',
      department: 'Computer Science',
      course: 'B.Tech',
      semester: '4'
    });
    studentToken = sRes.body.data.accessToken;
    studentUser = sRes.body.data;

    // Teacher
    const teacherUser = await User.create({
      name: 'Prof. Reporter',
      email: 'prof.reporter@example.com',
      password: 'password123',
      role: 'teacher'
    });
    teacherToken = generateAccessToken(teacherUser._id, teacherUser.role);

    // Seed mock attendance records for reporting
    await Attendance.create([
      { student: studentUser._id, subject: 'Software Eng', subjectCode: 'CS402', status: 'Present', date: new Date() },
      { student: studentUser._id, subject: 'Software Eng', subjectCode: 'CS402', status: 'Present', date: new Date() },
      { student: studentUser._id, subject: 'Software Eng', subjectCode: 'CS402', status: 'Absent', date: new Date() }
    ]);
  });

  describe('GET /api/reports/generate (Report Generator API)', () => {
    it('should generate daily report with aggregated totals', async () => {
      const res = await request(app)
        .get('/api/reports/generate?type=daily')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportType).toBe('daily');
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalStudents).toBeGreaterThan(0);
      expect(res.body.data.students).toBeDefined();
      expect(Array.isArray(res.body.data.students)).toBe(true);
    });

    it('should generate weekly report filtered by department', async () => {
      const res = await request(app)
        .get('/api/reports/generate?type=weekly&department=Computer Science')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportType).toBe('weekly');
    });

    it('should generate monthly report for specified month and year', async () => {
      const res = await request(app)
        .get('/api/reports/generate?type=monthly&month=7&year=2026')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportType).toBe('monthly');
    });

    it('should generate semester report', async () => {
      const res = await request(app)
        .get('/api/reports/generate?type=semester&semester=4')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportType).toBe('semester');
    });

    it('should enforce student role scoping so students only view their own report', async () => {
      const res = await request(app)
        .get('/api/reports/generate?type=daily')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.students).toBeDefined();
      res.body.data.students.forEach(item => {
        expect(item.id.toString()).toBe(studentUser._id.toString());
      });
    });
  });
});
