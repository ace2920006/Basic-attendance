const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const Leave = require('../src/models/Leave');
const Subject = require('../src/models/Subject');
const { generateAccessToken } = require('../src/utils/generateToken');

describe('🎓 Phase 27: Advanced Student Analytics Test Suite', () => {
  let studentToken, studentUser;
  let freshStudentToken, freshStudentUser;
  let teacherToken, teacherUser;
  let adminToken, adminUser;

  beforeEach(async () => {
    // 1. Register main Student
    studentUser = await User.create({
      name: 'Maya Lin',
      email: 'maya.lin@student.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2026-042',
      department: 'Computer Science',
      semester: 'Semester 4'
    });
    studentToken = generateAccessToken(studentUser._id, 'student');

    // 2. Register fresh Student (0 records)
    freshStudentUser = await User.create({
      name: 'Fresh Student',
      email: 'fresh.student@student.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2026-099',
      department: 'Computer Science',
      semester: 'Semester 4'
    });
    freshStudentToken = generateAccessToken(freshStudentUser._id, 'student');

    // 3. Create Teacher
    teacherUser = await User.create({
      name: 'Prof. Davis',
      email: 'prof.davis@faculty.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science'
    });
    teacherToken = generateAccessToken(teacherUser._id, 'teacher');

    // 4. Create Admin
    adminUser = await User.create({
      name: 'Admin Dean',
      email: 'dean@university.edu',
      password: 'password123',
      role: 'admin',
      department: 'Administration'
    });
    adminToken = generateAccessToken(adminUser._id, 'admin');

    // 5. Seed subjects
    await Subject.create([
      { code: 'CS301', name: 'Data Structures & Algorithms', totalClasses: 30, color: '#6366f1' },
      { code: 'CS302', name: 'Database Management Systems', totalClasses: 30, color: '#06b6d4' },
      { code: 'CS303', name: 'Operating Systems', totalClasses: 30, color: '#ec4899' }
    ]);

    // 6. Seed diverse attendance records for Maya Lin
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // CS302 (DBMS) - High attendance: 4 Present
    for (let i = 0; i < 4; i++) {
      await Attendance.create({
        student: studentUser._id,
        subject: 'Database Management Systems',
        subjectCode: 'CS302',
        status: 'Present',
        date: new Date(today.getTime() - i * oneDay)
      });
    }

    // CS301 (DSA) - Mixed: 3 Present, 1 Late, 1 Absent
    for (let i = 0; i < 3; i++) {
      await Attendance.create({
        student: studentUser._id,
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS301',
        status: 'Present',
        date: new Date(today.getTime() - (i + 4) * oneDay)
      });
    }
    await Attendance.create({
      student: studentUser._id,
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS301',
      status: 'Late',
      date: new Date(today.getTime() - 7 * oneDay)
    });
    await Attendance.create({
      student: studentUser._id,
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS301',
      status: 'Absent',
      date: new Date(today.getTime() - 8 * oneDay)
    });

    // CS303 (OS) - Low attendance: 1 Present, 3 Absent
    await Attendance.create({
      student: studentUser._id,
      subject: 'Operating Systems',
      subjectCode: 'CS303',
      status: 'Present',
      date: new Date(today.getTime() - 9 * oneDay)
    });
    for (let i = 0; i < 3; i++) {
      await Attendance.create({
        student: studentUser._id,
        subject: 'Operating Systems',
        subjectCode: 'CS303',
        status: 'Absent',
        date: new Date(today.getTime() - (10 + i) * oneDay)
      });
    }

    // 7. Seed an approved medical leave
    await Leave.create({
      student: studentUser._id,
      leaveType: 'Medical',
      startDate: new Date(today.getTime() - 15 * oneDay),
      endDate: new Date(today.getTime() - 14 * oneDay),
      reason: 'Medical recovery fever',
      status: 'Approved'
    });
  });

  describe('GET /api/analytics/student/me', () => {
    it('should compute comprehensive personal analytics for logged-in student', async () => {
      const res = await request(app)
        .get('/api/analytics/student/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data).toBeDefined();

      // Overall Attendance
      expect(data.overallAttendance).toBeDefined();
      expect(data.overallAttendance.totalClasses).toBe(13); // 4 DBMS + 5 DSA + 4 OS
      expect(data.overallAttendance.attendedClasses).toBe(9); // 4 + (3+1) + 1 = 9
      expect(data.overallAttendance.absentClasses).toBe(4); // 0 + 1 + 3 = 4
      expect(data.overallAttendance.lateClasses).toBe(1);
      expect(data.overallAttendance.benchmark).toBe(75);
      expect(typeof data.overallAttendance.percentage).toBe('number');

      // Best and Worst Subjects
      expect(data.bestSubject).toBeDefined();
      expect(data.bestSubject.code).toBe('CS302'); // 100% DBMS
      expect(data.bestSubject.percentage).toBe(100);

      expect(data.worstSubject).toBeDefined();
      expect(data.worstSubject.code).toBe('CS303'); // 25% OS
      expect(data.worstSubject.percentage).toBe(25);
      expect(data.worstSubject.consecutiveNeeded).toBeGreaterThan(0); // Needs recovery classes

      // Subject Attendance Breakdown
      expect(Array.isArray(data.subjectAttendance)).toBe(true);
      expect(data.subjectAttendance.length).toBe(3);

      // Status Counts: Late, Absent, Leave
      expect(data.lateCount).toBeDefined();
      expect(data.lateCount.total).toBe(1);
      expect(data.lateCount.subjectBreakdown.length).toBeGreaterThan(0);

      expect(data.absentCount).toBeDefined();
      expect(data.absentCount.total).toBe(4);

      expect(data.leaveCount).toBeDefined();
      expect(data.leaveCount.approved).toBe(1);
      expect(data.leaveCount.types.Medical).toBe(1);

      // Trends: Weekly & Monthly
      expect(Array.isArray(data.weeklyTrend)).toBe(true);
      expect(data.weeklyTrend.length).toBe(6);
      expect(data.weeklyTrend[0].benchmark).toBe(75);

      expect(Array.isArray(data.monthlyTrend)).toBe(true);
      expect(data.monthlyTrend.length).toBe(6);
      expect(data.monthlyTrend[0].benchmark).toBe(75);

      // Visual Curve
      expect(data.visualCurve).toBeDefined();
      expect(data.visualCurve.minBenchmark).toBe(75);
      expect(Array.isArray(data.visualCurve.points)).toBe(true);
      expect(data.visualCurve.points.length).toBeGreaterThan(0);
    });

    it('should return rich realistic demo fallback data when student has 0 records', async () => {
      const res = await request(app)
        .get('/api/analytics/student/me')
        .set('Authorization', `Bearer ${freshStudentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      expect(data.isDemo).toBe(true);
      expect(data.overallAttendance.percentage).toBeGreaterThan(70);
      expect(data.bestSubject).toBeDefined();
      expect(data.worstSubject).toBeDefined();
      expect(data.monthlyTrend.length).toBe(6);
      expect(data.weeklyTrend.length).toBe(6);
      expect(data.visualCurve.points.some((p) => p.month === 'Jun' || p.month === 'Jul' || p.month === 'Aug')).toBe(true);
    });

    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/analytics/student/me');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/analytics/student/:studentId', () => {
    it('should allow teacher to view student personal analytics', async () => {
      const res = await request(app)
        .get(`/api/analytics/student/${studentUser._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student.name).toBe('Maya Lin');
      expect(res.body.data.overallAttendance.totalClasses).toBe(13);
    });

    it('should allow admin to view student personal analytics', async () => {
      const res = await request(app)
        .get(`/api/analytics/student/${studentUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bestSubject.code).toBe('CS302');
    });
  });
});
