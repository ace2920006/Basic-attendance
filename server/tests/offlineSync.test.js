const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const Leave = require('../src/models/Leave');
const AuditLog = require('../src/models/AuditLog');
const { generateAccessToken } = require('../src/utils/generateToken');

describe('⚡ Phase 34: Offline Attendance Sync & Conflict Resolution Tests', () => {
  let teacherUser, teacherToken;
  let student1, student2, student3;

  beforeEach(async () => {
    // Create teacher
    teacherUser = await User.create({
      name: 'Prof. Alan Turing',
      email: 'alan.turing@university.edu',
      password: 'Password123!',
      role: 'teacher'
    });
    teacherToken = generateAccessToken(teacherUser._id, teacherUser.role);

    // Create students
    student1 = await User.create({
      name: 'Ada Lovelace',
      email: 'ada@university.edu',
      password: 'Password123!',
      role: 'student',
      rollNo: 'CS-2026-001',
      department: 'Computer Science'
    });

    student2 = await User.create({
      name: 'Grace Hopper',
      email: 'grace@university.edu',
      password: 'Password123!',
      role: 'student',
      rollNo: 'CS-2026-002',
      department: 'Computer Science'
    });

    student3 = await User.create({
      name: 'Charles Babbage',
      email: 'charles@university.edu',
      password: 'Password123!',
      role: 'student',
      rollNo: 'CS-2026-003',
      department: 'Computer Science'
    });
  });

  describe('1. Clean Offline Sync (No Conflicts)', () => {
    it('should successfully sync offline attendance records and mark telemetry fields', async () => {
      const batchId = `offline_batch_${Date.now()}`;
      const clientTimestamp = new Date('2026-09-12T10:00:00.000Z');

      const res = await request(app)
        .post('/api/attendance/offline-sync')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          batchId,
          subject: 'CS401',
          subjectCode: 'CS401',
          date: clientTimestamp.toISOString(),
          clientTimestamp: clientTimestamp.toISOString(),
          conflictStrategy: 'detect_only',
          records: [
            { studentId: student1._id, status: 'Present', notes: 'Present in class' },
            { studentId: student2._id, status: 'Absent', notes: 'Unexcused' }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasConflicts).toBe(false);
      expect(res.body.syncedCount).toBe(2);

      // Verify records in DB
      const dbRecords = await Attendance.find({ subject: 'CS401' });
      expect(dbRecords.length).toBe(2);
      expect(dbRecords[0].isOfflineSynced).toBe(true);
      expect(dbRecords[0].offlineBatchId).toBe(batchId);
      expect(dbRecords[0].conflictResolution).toBe('NONE');

      // Verify Audit Log
      const audit = await AuditLog.findOne({ action: 'OFFLINE_ATTENDANCE_SYNC' });
      expect(audit).toBeTruthy();
      expect(audit.details.batchId).toBe(batchId);
      expect(audit.details.syncedCount).toBe(2);
    });
  });

  describe('2. Conflict Detection (detect_only mode)', () => {
    it('should flag conflict when local record differs from server QR attendance', async () => {
      const targetDate = new Date('2026-09-12T09:00:00.000Z');

      // Seed student1 with existing server attendance marked Present via QR code
      await Attendance.create({
        student: student1._id,
        subject: 'CS401',
        status: 'Present',
        date: targetDate,
        verificationMethod: 'QR'
      });

      const batchId = `batch_conflict_${Date.now()}`;

      // Teacher was offline and marked student1 Absent, but student2 Present (clean)
      const res = await request(app)
        .post('/api/attendance/offline-sync')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          batchId,
          subject: 'CS401',
          date: targetDate.toISOString(),
          conflictStrategy: 'detect_only',
          records: [
            { studentId: student1._id, status: 'Absent', notes: 'Not spotted in seat' },
            { studentId: student2._id, status: 'Present', notes: 'Clean sync' }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasConflicts).toBe(true);
      expect(res.body.conflictsCount).toBe(1);
      expect(res.body.conflicts[0].studentName).toBe('Ada Lovelace');
      expect(res.body.conflicts[0].localStatus).toBe('Absent');
      expect(res.body.conflicts[0].serverStatus).toBe('Present');
      expect(res.body.syncedCount).toBe(1); // student2 was clean-synced
    });
  });

  describe('3. Local Authority Resolution (local_wins)', () => {
    it('should override server record with teacher physical roster', async () => {
      const targetDate = new Date('2026-09-12T09:00:00.000Z');

      // Existing server record is Present
      await Attendance.create({
        student: student1._id,
        subject: 'CS401',
        status: 'Present',
        date: targetDate
      });

      // Teacher overrides with Absent offline
      const res = await request(app)
        .post('/api/attendance/offline-sync')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          batchId: 'batch_local_wins',
          subject: 'CS401',
          date: targetDate.toISOString(),
          conflictStrategy: 'local_wins',
          records: [
            { studentId: student1._id, status: 'Absent', notes: 'Confirmed absent by instructor' }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.conflictsResolved).toBe(1);

      const updated = await Attendance.findOne({ student: student1._id, subject: 'CS401' });
      expect(updated.status).toBe('Absent');
      expect(updated.conflictResolution).toBe('LOCAL_OVERRIDE');
    });
  });

  describe('4. Smart Precedence Resolution (smart_merge)', () => {
    it('should give approved institutional leave precedence over offline attendance mark', async () => {
      const targetDate = new Date('2026-09-12T09:00:00.000Z');

      // Create approved medical leave for student3 spanning targetDate
      await Leave.create({
        student: student3._id,
        leaveType: 'Medical',
        startDate: new Date('2026-09-10T00:00:00.000Z'),
        endDate: new Date('2026-09-15T23:59:59.000Z'),
        reason: 'Hospital surgery recovery',
        status: 'Approved'
      });

      // Teacher offline marks student3 as Absent
      const res = await request(app)
        .post('/api/attendance/offline-sync')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          batchId: 'batch_smart_leave',
          subject: 'CS401',
          date: targetDate.toISOString(),
          conflictStrategy: 'smart_merge',
          records: [
            { studentId: student3._id, status: 'Absent', notes: 'Did not attend' }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const record = await Attendance.findOne({ student: student3._id, subject: 'CS401' });
      expect(record.status).toBe('On Leave');
      expect(record.conflictResolution).toBe('SMART_MERGED');
    });
  });

  describe('5. Interactive Manual Conflict Resolution', () => {
    it('should apply specific chosen statuses via /resolve-conflicts endpoint', async () => {
      const targetDate = new Date('2026-09-12T09:00:00.000Z');

      await Attendance.create({
        student: student1._id,
        subject: 'CS401',
        status: 'Absent',
        date: targetDate
      });

      const res = await request(app)
        .post('/api/attendance/resolve-conflicts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          batchId: 'batch_manual_res',
          subject: 'CS401',
          date: targetDate.toISOString(),
          resolvedConflicts: [
            {
              studentId: student1._id,
              chosenStatus: 'Late',
              chosenReason: 'Student arrived 20 minutes late with doctor slip'
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.resolvedCount).toBe(1);

      const resolvedDoc = await Attendance.findOne({ student: student1._id, subject: 'CS401' });
      expect(resolvedDoc.status).toBe('Late');
      expect(resolvedDoc.conflictResolution).toBe('MANUAL_RESOLVED');
      expect(resolvedDoc.notes).toContain('doctor slip');
    });
  });
});
