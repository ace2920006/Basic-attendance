const request = require('supertest');
const app = require('../src/app');
const Attendance = require('../src/models/Attendance');

describe('📈 Charts & Visual Analytics Test Suite', () => {
  let adminToken, studentToken, studentUser;

  beforeEach(async () => {
    // Register Admin
    const aRes = await request(app).post('/api/auth/register').send({
      name: 'Admin Charts',
      email: 'admin.charts@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminToken = aRes.body.data.accessToken;

    // Register Student
    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Chart Student',
      email: 'chart.student@example.com',
      password: 'password123',
      role: 'student',
      rollNo: 'CS202607'
    });
    studentToken = sRes.body.data.accessToken;
    studentUser = sRes.body.data;

    // Seed mock attendance data
    await Attendance.create([
      { student: studentUser._id, subject: 'Cloud Computing', subjectCode: 'CS501', status: 'Present', date: new Date() },
      { student: studentUser._id, subject: 'Cloud Computing', subjectCode: 'CS501', status: 'Present', date: new Date() },
      { student: studentUser._id, subject: 'Cloud Computing', subjectCode: 'CS501', status: 'Late', date: new Date() },
      { student: studentUser._id, subject: 'Cloud Computing', subjectCode: 'CS501', status: 'Absent', date: new Date() }
    ]);
  });

  describe('GET /api/charts/analytics', () => {
    it('should return complete structured chart datasets for dashboard charts', async () => {
      const res = await request(app)
        .get('/api/charts/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      // 1. Overall Attendance Ratio Chart
      const { attendanceStats } = res.body.data;
      expect(attendanceStats).toBeDefined();
      expect(attendanceStats.benchmarkRequirement).toBe(75);
      expect(attendanceStats.attendanceRate).toBeGreaterThanOrEqual(0);

      // 2. Department Comparison Chart
      const { departmentStats } = res.body.data;
      expect(Array.isArray(departmentStats)).toBe(true);
      expect(departmentStats.length).toBeGreaterThan(0);
      expect(departmentStats[0].code).toBeDefined();
      expect(departmentStats[0].avgAttendance).toBeDefined();

      // 3. Monthly Trend Chart
      const { monthlyTrend } = res.body.data;
      expect(Array.isArray(monthlyTrend)).toBe(true);
      expect(monthlyTrend.length).toBe(6);
      expect(monthlyTrend[0].month).toBeDefined();
      expect(monthlyTrend[0].benchmark).toBe(75);

      // 4. Subject-Wise Attendance Breakdown
      const { subjectStats } = res.body.data;
      expect(Array.isArray(subjectStats)).toBe(true);

      // 5. Leaderboard / Ranking Chart
      const { studentRankings } = res.body.data;
      expect(studentRankings).toBeDefined();
      expect(Array.isArray(studentRankings.topStudents)).toBe(true);
    });

    it('should return student-scoped chart analytics for student role', async () => {
      const res = await request(app)
        .get('/api/charts/analytics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attendanceStats).toBeDefined();
    });
  });
});
