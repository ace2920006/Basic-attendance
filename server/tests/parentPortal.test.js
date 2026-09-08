const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const Leave = require('../src/models/Leave');
const DefaulterRecord = require('../src/models/DefaulterRecord');
const Notification = require('../src/models/Notification');
const { generateAccessToken } = require('../src/utils/generateToken');

describe('👨‍👩‍👧 Phase 31: Parent/Guardian Portal Test Suite', () => {
  let studentUser, studentToken;
  let parentUser, parentToken;
  let teacherUser, teacherToken;
  let sampleAttendanceId;

  beforeEach(async () => {
    // 1. Create a Teacher user
    teacherUser = await User.create({
      name: 'Prof. Jenkins',
      email: 'jenkins@university.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science & Engineering'
    });
    teacherToken = generateAccessToken(teacherUser._id, teacherUser.role);

    // 2. Create a Student user
    studentUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@student.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2026-P01',
      department: 'Computer Science & Engineering',
      semester: 'Semester 4',
      guardianName: 'Elena Rivera',
      guardianEmail: 'parent.rivera@family.edu',
      guardianPhone: '+1 555-4321'
    });
    studentToken = generateAccessToken(studentUser._id, studentUser.role);

    // 3. Create a Parent user linked to the Student
    parentUser = await User.create({
      name: 'Elena Rivera',
      email: 'parent.rivera@family.edu',
      password: 'password123',
      role: 'parent',
      wardRollNo: 'CS-2026-P01',
      linkedStudents: [studentUser._id]
    });
    parentToken = generateAccessToken(parentUser._id, parentUser.role);

    // 4. Create sample attendance records for the student
    const att1 = await Attendance.create({
      student: studentUser._id,
      subject: 'Database Management Systems',
      subjectCode: 'CS302',
      date: new Date('2026-09-01'),
      status: 'Present',
      markedBy: teacherUser._id
    });
    sampleAttendanceId = att1._id;

    await Attendance.create({
      student: studentUser._id,
      subject: 'Database Management Systems',
      subjectCode: 'CS302',
      date: new Date('2026-09-02'),
      status: 'Absent',
      markedBy: teacherUser._id
    });

    await Attendance.create({
      student: studentUser._id,
      subject: 'Computer Networks',
      subjectCode: 'CS304',
      date: new Date('2026-09-03'),
      status: 'Present',
      markedBy: teacherUser._id
    });

    // 5. Create a sample leave request
    await Leave.create({
      student: studentUser._id,
      leaveType: 'Medical',
      startDate: new Date('2026-09-04'),
      endDate: new Date('2026-09-05'),
      reason: 'Viral fever with doctor note',
      status: 'Approved',
      reviewedBy: teacherUser._id,
      remarks: 'Granted medical leave'
    });
  });

  describe('🔐 1. Authentication & Registration for Parent Role', () => {
    it('should allow public registration with parent role and link ward via roll number', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Robert Davis',
          email: 'robert.davis@parents.org',
          password: 'password123',
          role: 'parent',
          wardRollNo: 'CS-2026-P01'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('parent');

      // Verify the user in DB has linkedStudents pointing to Alex
      const dbParent = await User.findById(res.body.data._id);
      expect(dbParent.role).toBe('parent');
      expect(dbParent.linkedStudents).toContainEqual(studentUser._id);
    });

    it('should authenticate registered parent via login endpoint', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'parent.rivera@family.edu',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('parent');
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe('👁️ 2. Parent Ward Academic Monitoring Endpoints', () => {
    it('should return linked wards list via GET /api/parent/wards', async () => {
      const res = await request(app)
        .get('/api/parent/wards')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].rollNo).toBe('CS-2026-P01');
      expect(res.body.data[0].name).toBe('Alex Rivera');
    });

    it('should return comprehensive overview via GET /api/parent/overview', async () => {
      const res = await request(app)
        .get('/api/parent/overview')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ward.rollNo).toBe('CS-2026-P01');
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.totalClasses).toBe(3);
      expect(res.body.data.stats.attendedClasses).toBe(2);
      expect(res.body.data.stats.absentClasses).toBe(1);
      expect(res.body.data.subjectSummary.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.readOnlyGuarantee).toBe(true);
    });

    it('should return detailed attendance log via GET /api/parent/attendance', async () => {
      const res = await request(app)
        .get('/api/parent/attendance')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.monthlyTrend).toBeDefined();
    });

    it('should filter attendance records by subject via GET /api/parent/attendance?subject=CS302', async () => {
      const res = await request(app)
        .get('/api/parent/attendance?subject=Database Management Systems')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });

    it('should return subject-wise breakdown via GET /api/parent/subjects', async () => {
      const res = await request(app)
        .get('/api/parent/subjects')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      const dbSubject = res.body.data.find(s => s.code === 'CS302');
      expect(dbSubject).toBeDefined();
      expect(dbSubject.totalClasses).toBe(2);
      expect(dbSubject.attended).toBe(1);
      expect(dbSubject.percentage).toBe(50);
      expect(dbSubject.status).toBe('Critical Defaulter');
    });

    it('should return ward leave history via GET /api/parent/leaves', async () => {
      const res = await request(app)
        .get('/api/parent/leaves')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].leaveType).toBe('Medical');
      expect(res.body.data[0].status).toBe('Approved');
    });

    it('should return attendance warnings & active tier via GET /api/parent/warnings', async () => {
      const res = await request(app)
        .get('/api/parent/warnings')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.attendance.percentage).toBeLessThan(75);
      expect(res.body.activeTier).toBeDefined();
      expect(res.body.advisor).toBeDefined();
      expect(res.body.attendance.consecutiveNeeded).toBeGreaterThan(0);
    });

    it('should return notifications feed via GET /api/parent/notifications', async () => {
      // Create a test notification for parent
      await Notification.create({
        recipient: parentUser._id,
        title: 'Weekly Attendance Report',
        message: 'Your ward Alex Rivera attended 2 out of 3 classes this week.',
        type: 'info',
        eventType: 'GENERAL',
        unread: true
      });

      const res = await request(app)
        .get('/api/parent/notifications')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('🛑 3. STRICT READ-ONLY ENFORCEMENT ("Parent should NOT be able to modify attendance")', () => {
    it('MUST REJECT parent from marking individual attendance (POST /api/attendance)', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          student: studentUser._id,
          subject: 'Database Management Systems',
          status: 'Present'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('MUST REJECT parent from marking bulk attendance (POST /api/attendance/bulk)', async () => {
      const res = await request(app)
        .post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          records: [{ studentId: studentUser._id, status: 'Present' }]
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('MUST REJECT parent from scanning QR attendance (POST /api/attendance/scan-qr)', async () => {
      const res = await request(app)
        .post('/api/attendance/scan-qr')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          qrToken: 'dummy_token'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('MUST REJECT parent from modifying attendance record (PUT /api/attendance/:id)', async () => {
      const res = await request(app)
        .put(`/api/attendance/${sampleAttendanceId}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          status: 'Present',
          notes: 'Parent tried to override absent record'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('MUST REJECT parent from deleting attendance record (DELETE /api/attendance/:id)', async () => {
      const res = await request(app)
        .delete(`/api/attendance/${sampleAttendanceId}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('MUST REJECT parent from applying leaves on behalf of student (POST /api/leaves)', async () => {
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          startDate: '2026-09-10',
          endDate: '2026-09-12',
          reason: 'Parent applying for ward'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('MUST REJECT parent from updating/approving leave status (PUT /api/leaves/:id)', async () => {
      const leave = await Leave.findOne({ student: studentUser._id });
      const res = await request(app)
        .put(`/api/leaves/${leave._id}`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          status: 'Approved',
          remarks: 'Parent approved'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });
  });

  describe('🔗 4. Ward Linking Functionality', () => {
    it('should link a new student to parent via POST /api/parent/link-ward', async () => {
      const newStudent = await User.create({
        name: 'Jordan Rivera',
        email: 'jordan.rivera@student.edu',
        password: 'password123',
        role: 'student',
        rollNo: 'CS-2026-P02',
        department: 'Information Technology'
      });

      const res = await request(app)
        .post('/api/parent/link-ward')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          rollNo: 'CS-2026-P02'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rollNo).toBe('CS-2026-P02');

      const updatedParent = await User.findById(parentUser._id);
      expect(updatedParent.linkedStudents).toContainEqual(newStudent._id);
    });
  });
});
