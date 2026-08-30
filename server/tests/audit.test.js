const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const Leave = require('../src/models/Leave');
const AuditLog = require('../src/models/AuditLog');
const { generateAccessToken } = require('../src/utils/generateToken');

describe('Phase 24: Complete Audit Logging Test Suite', () => {
  let adminUser, teacherUser, studentUser;
  let adminToken, teacherToken, studentToken;

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Create Admin User
    adminUser = await User.create({
      name: 'Super Administrator',
      email: 'admin@university.edu',
      password: 'password123',
      role: 'admin',
      department: 'Administration'
    });
    adminToken = generateAccessToken(adminUser._id, 'admin');

    // 2. Create Teacher User
    teacherUser = await User.create({
      name: 'Professor Robert Smith',
      email: 'teacher@university.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor'
    });
    teacherToken = generateAccessToken(teacherUser._id, 'teacher');

    // 3. Create Student User
    studentUser = await User.create({
      name: 'Alice Johnson',
      email: 'alice@university.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CSE-2026-001',
      department: 'Computer Science & Engineering',
      semester: 'Semester 6'
    });
    studentToken = generateAccessToken(studentUser._id, 'student');
  });

  describe('1. LOGIN & LOGOUT Audit Logging', () => {
    it('should record LOGIN audit log on successful authentication', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teacher@university.edu',
          password: 'password123'
        });

      expect(res.status).toBe(200);

      const auditEntry = await AuditLog.findOne({
        action: 'LOGIN',
        status: 'SUCCESS',
        userEmail: 'teacher@university.edu'
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.userRole).toBe('teacher');
      expect(auditEntry.userName).toBe('Professor Robert Smith');
    });

    it('should record LOGIN audit log on failed authentication attempt', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teacher@university.edu',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);

      const auditEntry = await AuditLog.findOne({
        action: 'LOGIN',
        status: 'FAILED',
        'details.email': 'teacher@university.edu'
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.status).toBe('FAILED');
    });

    it('should record LOGOUT audit log when user logs out', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);

      const auditEntry = await AuditLog.findOne({
        action: 'LOGOUT',
        user: teacherUser._id
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.userRole).toBe('teacher');
    });
  });

  describe('2. CREATE_STUDENT & DELETE_STUDENT Audit Logging', () => {
    it('should record CREATE_STUDENT audit log when student registers', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Martin',
          email: 'bob@university.edu',
          password: 'password123',
          rollNo: 'CSE-2026-042',
          department: 'Computer Science & Engineering',
          semester: 'Semester 4'
        });

      expect(res.status).toBe(201);

      const auditEntry = await AuditLog.findOne({
        action: 'CREATE_STUDENT',
        targetUserRollNo: 'CSE-2026-042'
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.targetUserName).toBe('Bob Martin');
    });

    it('should record CREATE_STUDENT audit log when admin provisions student', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Charlie Brown',
          email: 'charlie@university.edu',
          password: 'password123',
          role: 'student',
          rollNo: 'IT-2026-105',
          department: 'Information Technology',
          semester: 'Semester 2'
        });

      expect(res.status).toBe(201);

      const auditEntry = await AuditLog.findOne({
        action: 'CREATE_STUDENT',
        targetUserRollNo: 'IT-2026-105'
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.targetUserName).toBe('Charlie Brown');
      expect(auditEntry.userRole).toBe('admin');
    });

    it('should record DELETE_STUDENT audit log when admin removes a student', async () => {
      const res = await request(app)
        .delete(`/api/users/${studentUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const auditEntry = await AuditLog.findOne({
        action: 'DELETE_STUDENT',
        targetUser: studentUser._id
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.targetUserName).toBe('Alice Johnson');
      expect(auditEntry.userRole).toBe('admin');
    });
  });

  describe('3. MARK_ATTENDANCE & EDIT_ATTENDANCE Audit Logging', () => {
    it('should record MARK_ATTENDANCE audit log on manual attendance marking', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: studentUser._id,
          subject: 'Distributed Systems',
          subjectCode: 'CS601',
          status: 'Present',
          date: new Date(),
          notes: 'Present in Lecture Hall A'
        });

      expect(res.status).toBe(201);

      const auditEntry = await AuditLog.findOne({
        action: 'MARK_ATTENDANCE',
        targetUser: studentUser._id
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.targetUserName).toBe('Alice Johnson');
      expect(auditEntry.details.subject).toBe('Distributed Systems');
    });

    it('should record EDIT_ATTENDANCE audit log with before/after state diff and reason (Absent -> Present)', async () => {
      // 1. Create an initial Absent record
      const attendance = await Attendance.create({
        student: studentUser._id,
        subject: 'Algorithms & Data Structures',
        subjectCode: 'CS301',
        status: 'Absent',
        date: new Date(),
        markedBy: teacherUser._id
      });

      // 2. Teacher updates attendance from Absent to Present with reason
      const res = await request(app)
        .put(`/api/attendance/${attendance._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          status: 'Present',
          reason: 'Medical document verified',
          notes: 'Medical certificate approved by faculty'
        });

      expect(res.status).toBe(200);

      const auditEntry = await AuditLog.findOne({
        action: 'EDIT_ATTENDANCE',
        'details.attendanceId': attendance._id
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.originalValue).toBe('Absent');
      expect(auditEntry.newValue).toBe('Present');
      expect(auditEntry.transition).toBe('Absent → Present');
      expect(auditEntry.reason).toBe('Medical document verified');
      expect(auditEntry.targetUserName).toBe('Alice Johnson');
      expect(auditEntry.userName).toBe('Professor Robert Smith');
    });
  });

  describe('4. APPROVE_LEAVE & REJECT_LEAVE Audit Logging', () => {
    let leaveDoc;

    beforeEach(async () => {
      leaveDoc = await Leave.create({
        student: studentUser._id,
        leaveType: 'Medical',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        reason: 'Severe fever and hospital consultation',
        status: 'Pending'
      });
    });

    it('should record APPROVE_LEAVE audit log when faculty approves leave', async () => {
      const res = await request(app)
        .put(`/api/leaves/${leaveDoc._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          status: 'Approved',
          remarks: 'Medical prescription reviewed and approved'
        });

      expect(res.status).toBe(200);

      const auditEntry = await AuditLog.findOne({
        action: 'APPROVE_LEAVE',
        targetUser: studentUser._id
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.originalValue).toBe('Pending');
      expect(auditEntry.newValue).toBe('Approved');
      expect(auditEntry.targetUserName).toBe('Alice Johnson');
      expect(auditEntry.reason).toBe('Medical prescription reviewed and approved');
    });

    it('should record REJECT_LEAVE audit log when faculty rejects leave', async () => {
      const res = await request(app)
        .put(`/api/leaves/${leaveDoc._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          status: 'Rejected',
          remarks: 'Insufficient medical documentation attached'
        });

      expect(res.status).toBe(200);

      const auditEntry = await AuditLog.findOne({
        action: 'REJECT_LEAVE',
        targetUser: studentUser._id
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.originalValue).toBe('Pending');
      expect(auditEntry.newValue).toBe('Rejected');
      expect(auditEntry.targetUserName).toBe('Alice Johnson');
    });
  });

  describe('5. EXPORT_REPORT & CHANGE_SETTINGS Audit Logging', () => {
    it('should record EXPORT_REPORT audit log when report is exported', async () => {
      const res = await request(app)
        .get('/api/reports/export?type=daily&format=csv')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);

      const auditEntry = await AuditLog.findOne({
        action: 'EXPORT_REPORT',
        user: teacherUser._id
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.details.format).toBe('csv');
      expect(auditEntry.details.reportType).toBe('daily');
    });

    it('should record CHANGE_SETTINGS audit log when attendance rules are updated', async () => {
      const res = await request(app)
        .put('/api/attendance-rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          minAttendancePercentage: 80,
          gracePeriodMinutes: 10
        });

      expect(res.status).toBe(200);

      const auditEntry = await AuditLog.findOne({
        action: 'CHANGE_SETTINGS',
        resource: 'Attendance Rules'
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.userRole).toBe('admin');
      expect(auditEntry.details.minAttendancePercentage).toBe(80);
    });
  });

  describe('6. Querying, Filtering & Stats for Audit Logs', () => {
    beforeEach(async () => {
      // Seed sample audit logs
      await AuditLog.create([
        {
          user: teacherUser._id,
          userName: 'Professor Robert Smith',
          userRole: 'teacher',
          targetUser: studentUser._id,
          targetUserName: 'Alice Johnson',
          action: 'EDIT_ATTENDANCE',
          originalValue: 'Absent',
          newValue: 'Present',
          transition: 'Absent → Present',
          reason: 'Medical document verified',
          status: 'SUCCESS'
        },
        {
          user: teacherUser._id,
          userName: 'Professor Robert Smith',
          userRole: 'teacher',
          action: 'LOGIN',
          status: 'SUCCESS'
        },
        {
          userName: 'Guest / Anonymous',
          userRole: 'anonymous',
          action: 'LOGIN',
          status: 'FAILED',
          details: { email: 'fake@university.edu' }
        }
      ]);
    });

    it('should retrieve audit logs with action filter', async () => {
      const res = await request(app)
        .get('/api/audit-logs?action=EDIT_ATTENDANCE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].transition).toBe('Absent → Present');
      expect(res.body.data[0].reason).toBe('Medical document verified');
    });

    it('should search audit logs by reason keyword', async () => {
      const res = await request(app)
        .get('/api/audit-logs?search=Medical')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].targetUserName).toBe('Alice Johnson');
    });

    it('should return aggregated stats including 10-action breakdown', async () => {
      const res = await request(app)
        .get('/api/audit-logs/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalEvents).toBeGreaterThanOrEqual(3);
      expect(res.body.data.actionCounts.EDIT_ATTENDANCE).toBe(1);
    });

    it('should export audit logs to CSV', async () => {
      const res = await request(app)
        .get('/api/audit-logs/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Medical document verified');
      expect(res.text).toContain('Absent → Present');
    });
  });
});
