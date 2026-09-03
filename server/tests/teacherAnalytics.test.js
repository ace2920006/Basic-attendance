const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const Class = require('../src/models/Class');
const Subject = require('../src/models/Subject');
const { generateAccessToken } = require('../src/utils/generateToken');
const { computeTeacherAnalytics, getFallbackTeacherAnalytics } = require('../src/utils/teacherAnalyticsEngine');

describe('📊 Phase 28: Teacher Analytics Test Suite', () => {
  let teacherToken, teacherUser;
  let adminToken, adminUser;
  let studentToken, studentUser;
  let student1, student2, student3;
  let subject1, subject2;

  beforeEach(async () => {
    // 1. Seed subjects first
    subject1 = await Subject.create({
      code: 'CS401',
      name: 'Database Systems',
      department: 'Computer Science',
      instructor: 'Dr. John Smith'
    });

    subject2 = await Subject.create({
      code: 'CS405',
      name: 'Web Technologies',
      department: 'Computer Science',
      instructor: 'Dr. John Smith'
    });

    // 2. Create Teacher with subject references
    teacherUser = await User.create({
      name: 'Dr. John Smith',
      email: 'john.smith@univ.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science',
      designation: 'Professor',
      assignedSubjects: [subject1._id, subject2._id]
    });
    teacherToken = generateAccessToken(teacherUser._id, 'teacher');

    // 3. Create Admin
    adminUser = await User.create({
      name: 'Dean Wilson',
      email: 'dean.wilson@univ.edu',
      password: 'password123',
      role: 'admin',
      department: 'Administration'
    });
    adminToken = generateAccessToken(adminUser._id, 'admin');

    // 4. Create Student
    studentUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@student.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2024-089',
      department: 'Computer Science',
      semester: 'Semester 4'
    });
    studentToken = generateAccessToken(studentUser._id, 'student');

    // 4. Create additional students for testing
    student1 = await User.create({
      name: 'Carlos Gomez',
      email: 'carlos@univ.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2024-003',
      department: 'Computer Science',
      division: 'Sec B'
    });

    student2 = await User.create({
      name: 'Bella Thorne',
      email: 'bella@univ.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2024-002',
      department: 'Computer Science',
      division: 'Sec A'
    });

    student3 = await User.create({
      name: 'Diana Prince',
      email: 'diana@univ.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2024-004',
      department: 'Computer Science',
      division: 'Sec A'
    });
  });

  describe('🧠 1. Unit: Teacher Analytics Engine Computation', () => {
    it('should generate fallback analytics with exact prompt weekday rates when 0 records exist', () => {
      const analytics = getFallbackTeacherAnalytics(teacherUser);

      expect(analytics).toBeDefined();
      expect(analytics.isDemo).toBe(true);

      // Verify all 7 core metrics exist
      expect(analytics.overallAttendance).toBeDefined();
      expect(analytics.mostAbsentStudents).toBeDefined();
      expect(analytics.mostLateStudents).toBeDefined();
      expect(analytics.attendanceByLecture).toBeDefined();
      expect(analytics.attendanceByWeekday).toBeDefined();
      expect(analytics.subjectAttendance).toBeDefined();
      expect(analytics.divisionComparison).toBeDefined();

      // Verify exact prompt weekday rates: Mon 82%, Tue 91%, Wed 76%, Thu 88%, Fri 69%
      const weekdays = analytics.attendanceByWeekday;
      expect(weekdays.find(w => w.dayName === 'Monday').attendanceRate).toBe(82.0);
      expect(weekdays.find(w => w.dayName === 'Tuesday').attendanceRate).toBe(91.0);
      expect(weekdays.find(w => w.dayName === 'Wednesday').attendanceRate).toBe(76.0);
      expect(weekdays.find(w => w.dayName === 'Thursday').attendanceRate).toBe(88.0);
      expect(weekdays.find(w => w.dayName === 'Friday').attendanceRate).toBe(69.0);

      // Verify Friday drop insight detection
      expect(analytics.weekdayInsights.lowestDay).toBe('Friday');
      expect(analytics.weekdayInsights.fridayDrop).toBe(true);
      expect(analytics.weekdayInsights.fridayDelta).toBe(-12.2);
      expect(analytics.weekdayInsights.insightSummary).toContain('Friday');
    });

    it('should compute real database metrics accurately across all 7 dimensions', () => {
      // Build test records with specific weekdays:
      // Mon (2026-08-24): 2 Present, 0 Absent
      // Fri (2026-08-28): 1 Present, 2 Absent (poor Friday pattern)
      const mockRecords = [
        {
          student: student1,
          subjectCode: 'CS401',
          subject: 'Database Systems',
          division: 'Sec B',
          timeSlot: '09:00 AM - 10:00 AM',
          status: 'Present',
          date: new Date('2026-08-24T09:00:00.000Z') // Monday
        },
        {
          student: student2,
          subjectCode: 'CS401',
          subject: 'Database Systems',
          division: 'Sec A',
          timeSlot: '09:00 AM - 10:00 AM',
          status: 'Late',
          date: new Date('2026-08-24T09:00:00.000Z') // Monday
        },
        {
          student: student1,
          subjectCode: 'CS401',
          subject: 'Database Systems',
          division: 'Sec B',
          timeSlot: '10:15 AM - 11:45 AM',
          status: 'Absent',
          date: new Date('2026-08-28T10:15:00.000Z') // Friday
        },
        {
          student: student2,
          subjectCode: 'CS401',
          subject: 'Database Systems',
          division: 'Sec A',
          timeSlot: '10:15 AM - 11:45 AM',
          status: 'Absent',
          date: new Date('2026-08-28T10:15:00.000Z') // Friday
        },
        {
          student: student3,
          subjectCode: 'CS401',
          subject: 'Database Systems',
          division: 'Sec A',
          timeSlot: '10:15 AM - 11:45 AM',
          status: 'Present',
          date: new Date('2026-08-28T10:15:00.000Z') // Friday
        }
      ];

      const analytics = computeTeacherAnalytics({
        teacher: teacherUser,
        attendanceRecords: mockRecords,
        subjects: [subject1],
        rules: { minAttendancePercentage: 75, statuses: { Late: { weight: 0.8 } } }
      });

      expect(analytics.isDemo).toBe(false);
      expect(analytics.overallAttendance.totalStudentAttendances).toBe(5);
      expect(analytics.overallAttendance.presentCount).toBe(2);
      expect(analytics.overallAttendance.lateCount).toBe(1);
      expect(analytics.overallAttendance.absentCount).toBe(2);

      // Verify most absent list includes student1 and student2
      expect(analytics.mostAbsentStudents.length).toBeGreaterThan(0);
      expect(analytics.mostAbsentStudents.some(s => s.name === 'Carlos Gomez')).toBe(true);

      // Verify most late list includes student2 (Bella Thorne)
      expect(analytics.mostLateStudents.length).toBeGreaterThan(0);
      expect(analytics.mostLateStudents[0].name).toBe('Bella Thorne');

      // Verify Friday attendance is lower than Monday
      const mon = analytics.attendanceByWeekday.find(w => w.dayName === 'Monday');
      const fri = analytics.attendanceByWeekday.find(w => w.dayName === 'Friday');
      expect(fri.attendanceRate).toBeLessThan(mon.attendanceRate);
    });
  });

  describe('🔐 2. RBAC & Access Control', () => {
    it('should allow teacher to fetch own analytics via GET /api/analytics/teacher/me', async () => {
      const res = await request(app)
        .get('/api/analytics/teacher/me')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.overallAttendance).toBeDefined();
      expect(res.body.data.attendanceByWeekday).toBeDefined();
    });

    it('should allow admin to fetch teacher analytics via GET /api/analytics/teacher/:teacherId', async () => {
      const res = await request(app)
        .get(`/api/analytics/teacher/${teacherUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.teacher.name).toBe('Dr. John Smith');
    });

    it('should block student from accessing teacher analytics (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/analytics/teacher/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('🔍 3. Query Filters & Deficit Math', () => {
    it('should filter analytics by subject when query parameter is provided', async () => {
      // Seed an attendance record marked by teacher
      await Attendance.create({
        student: student1._id,
        subjectCode: 'CS401',
        subject: 'Database Systems',
        markedBy: teacherUser._id,
        status: 'Present',
        date: new Date()
      });

      const res = await request(app)
        .get('/api/analytics/teacher/me?subject=CS401')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.overallAttendance).toBeDefined();
    });

    it('should support timeframe filter (30days)', async () => {
      const res = await request(app)
        .get('/api/analytics/teacher/me?timeframe=30days')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.attendanceByWeekday).toHaveLength(5);
    });
  });
});
