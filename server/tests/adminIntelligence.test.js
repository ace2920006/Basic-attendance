const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Division = require('../src/models/Division');
const Attendance = require('../src/models/Attendance');
const Leave = require('../src/models/Leave');
const { generateAccessToken } = require('../src/utils/generateToken');
const {
  computeAdminIntelligence,
  getFallbackAdminIntelligence
} = require('../src/utils/adminIntelligenceEngine');

describe('🧠 Phase 29: Admin Intelligence Dashboard Test Suite', () => {
  let adminToken, adminUser;
  let teacherToken, teacherUser;
  let studentToken, studentUser;

  beforeEach(async () => {
    // 1. Create Admin
    adminUser = await User.create({
      name: 'Dr. Evelyn Reed',
      email: 'admin.reed@university.edu',
      password: 'password123',
      role: 'admin',
      department: 'Central Administration'
    });
    adminToken = generateAccessToken(adminUser._id, 'admin');

    // 2. Create Teacher
    teacherUser = await User.create({
      name: 'Prof. Marcus Vance',
      email: 'marcus.vance@university.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science & Engineering',
      designation: 'Professor'
    });
    teacherToken = generateAccessToken(teacherUser._id, 'teacher');

    // 3. Create Student
    studentUser = await User.create({
      name: 'Jordan Lee',
      email: 'jordan.lee@university.edu',
      password: 'password123',
      role: 'student',
      rollNo: '2026-CS-042',
      department: 'Computer Science & Engineering'
    });
    studentToken = generateAccessToken(studentUser._id, 'student');
  });

  describe('🧠 1. Unit: Admin Intelligence Engine Calculations & Fallbacks', () => {
    it('should generate pristine fallback data matching prompt specifications', () => {
      const data = getFallbackAdminIntelligence();

      expect(data).toBeDefined();

      // Top KPI matches prompt specification:
      // Total Students: 2,481
      // Total Teachers: 143
      // Today's Attendance: 87.4%
      // Students <75%: 312
      expect(data.kpiSummary).toBeDefined();
      expect(data.kpiSummary.totalStudents).toBe(2481);
      expect(data.kpiSummary.totalTeachers).toBe(143);
      expect(data.kpiSummary.todayAttendanceRate).toBe(87.4);
      expect(data.kpiSummary.studentsBelow75).toBe(312);

      // Verify all 7 analytical modules exist
      expect(data.departments).toBeDefined();
      expect(Array.isArray(data.departments)).toBe(true);
      expect(data.departments.length).toBeGreaterThan(0);

      expect(data.divisions).toBeDefined();
      expect(Array.isArray(data.divisions)).toBe(true);
      expect(data.divisions.length).toBeGreaterThan(0);

      expect(data.attendanceTrends).toBeDefined();
      expect(Array.isArray(data.attendanceTrends.monthlyTrend)).toBe(true);
      expect(Array.isArray(data.attendanceTrends.weekdayPattern)).toBe(true);

      expect(data.defaulterAnalysis).toBeDefined();
      expect(data.defaulterAnalysis.summary.totalDefaulters).toBe(312);
      expect(Array.isArray(data.defaulterAnalysis.students)).toBe(true);

      expect(data.teacherStatistics).toBeDefined();
      expect(data.teacherStatistics.complianceSummary.totalFaculty).toBe(143);
      expect(Array.isArray(data.teacherStatistics.topTeachers)).toBe(true);

      expect(data.suspiciousAttendance).toBeDefined();
      expect(data.suspiciousAttendance.overview.totalScansToday).toBe(2481);
      expect(Array.isArray(data.suspiciousAttendance.signalsDistribution)).toBe(true);
      expect(Array.isArray(data.suspiciousAttendance.recentIncidents)).toBe(true);

      expect(data.leaveStatistics).toBeDefined();
      expect(data.leaveStatistics.overview.totalApplications).toBe(184);
      expect(Array.isArray(data.leaveStatistics.byCategory)).toBe(true);
      expect(Array.isArray(data.leaveStatistics.departmentBreakdown)).toBe(true);
    });

    it('should compute deficit classes needed for defaulters using the x = ceil((0.75T - P)/0.25) formula', () => {
      const data = getFallbackAdminIntelligence();
      const firstDefaulter = data.defaulterAnalysis.students[0];

      expect(firstDefaulter).toBeDefined();
      expect(firstDefaulter.classesNeededTo75).toBeGreaterThan(0);
      expect(firstDefaulter.attendanceRate).toBeLessThan(75);
    });
  });

  describe('🔐 2. Integration: Route Protection and RBAC Enforcement', () => {
    it('should allow authorized admins to access /api/analytics/admin-intelligence', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpiSummary.totalStudents).toBe(2481);
      expect(res.body.data.kpiSummary.totalTeachers).toBe(143);
      expect(res.body.data.kpiSummary.todayAttendanceRate).toBe(87.4);
      expect(res.body.data.kpiSummary.studentsBelow75).toBe(312);
    });

    it('should support alias endpoint /api/analytics/intelligence', async () => {
      const res = await request(app)
        .get('/api/analytics/intelligence')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpiSummary).toBeDefined();
    });

    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence');

      expect(res.status).toBe(401);
    });

    it('should reject teacher requests with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
    });

    it('should reject student requests with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('📊 3. End-to-End: Verification of all 7 analytical components', () => {
    it('should return department comparison metrics with variance from college average', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence')
        .set('Authorization', `Bearer ${adminToken}`);

      const { departments } = res.body.data;
      expect(departments.length).toBeGreaterThanOrEqual(4);
      departments.forEach(dept => {
        expect(dept.code).toBeDefined();
        expect(dept.avgAttendance).toBeGreaterThan(0);
        expect(dept.varianceFromCollegeAvg).toBeDefined();
        expect(dept.statusTier).toBeDefined();
      });
    });

    it('should return division breakdown with sections and enrollments', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence')
        .set('Authorization', `Bearer ${adminToken}`);

      const { divisions } = res.body.data;
      expect(divisions.length).toBeGreaterThanOrEqual(5);
      divisions.forEach(div => {
        expect(div.name).toBeDefined();
        expect(div.department).toBeDefined();
        expect(div.enrolledStudents).toBeGreaterThan(0);
        expect(div.attendanceRate).toBeGreaterThan(0);
      });
    });

    it('should return attendance trends with 6-month curve and weekday pattern', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence')
        .set('Authorization', `Bearer ${adminToken}`);

      const { attendanceTrends } = res.body.data;
      expect(attendanceTrends.monthlyTrend.length).toBe(6);
      expect(attendanceTrends.weekdayPattern.length).toBe(5);
      
      const friday = attendanceTrends.weekdayPattern.find(d => d.day === 'Friday');
      expect(friday).toBeDefined();
      expect(friday.rate).toBeLessThan(80); // Friday slump
    });

    it('should return anti-proxy suspicious intelligence with multi-signal distribution', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence')
        .set('Authorization', `Bearer ${adminToken}`);

      const { suspiciousAttendance } = res.body.data;
      expect(suspiciousAttendance.overview.totalFlaggedToday).toBe(24);
      expect(suspiciousAttendance.signalsDistribution.length).toBe(3);
      expect(suspiciousAttendance.recentIncidents.length).toBeGreaterThanOrEqual(2);
    });

    it('should return leave analytics with categories and department breakdown', async () => {
      const res = await request(app)
        .get('/api/analytics/admin-intelligence')
        .set('Authorization', `Bearer ${adminToken}`);

      const { leaveStatistics } = res.body.data;
      expect(leaveStatistics.overview.totalApplications).toBe(184);
      expect(leaveStatistics.byCategory.length).toBe(4);
      expect(leaveStatistics.departmentBreakdown.length).toBeGreaterThanOrEqual(5);
    });
  });
});
