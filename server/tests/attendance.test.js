const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');

const { generateAccessToken } = require('../src/utils/generateToken');

describe('📋 Attendance Module Tests', () => {
  let teacherToken, studentToken, teacherUser, studentUser;

  beforeEach(async () => {
    // Register teacher
    teacherUser = await User.create({
      name: 'Teacher Smith',
      email: 'teacher.smith@example.com',
      password: 'password123',
      role: 'teacher'
    });
    teacherToken = generateAccessToken(teacherUser._id, teacherUser.role);

    // Register student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Student Alex',
      email: 'student.alex@example.com',
      password: 'password123',
      role: 'student',
      rollNo: 'CS202602'
    });
    studentToken = studentRes.body.data.accessToken;
    studentUser = studentRes.body.data;
  });

  describe('POST /api/attendance (Mark Single Attendance)', () => {
    it('should mark attendance for a student as Present', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: studentUser._id,
          subject: 'Data Structures',
          subjectCode: 'CS201',
          status: 'Present',
          notes: 'Active participant'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Present');
      expect(res.body.data.subject).toBe('Data Structures');
    });

    it('should reject attendance marking if studentId or subject is missing', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: studentUser._id
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/attendance/bulk (Mark Bulk Attendance)', () => {
    it('should mark bulk attendance for multiple records', async () => {
      const records = [
        { studentId: studentUser._id, status: 'Present', notes: 'Slot 1' }
      ];

      const res = await request(app)
        .post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          subject: 'Algorithms',
          subjectCode: 'CS202',
          records
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });
  });

  describe('GET /api/attendance & Defaulter Stats', () => {
    beforeEach(async () => {
      // Create 4 attendance records: 2 Present, 2 Absent (50% attendance rate)
      await Attendance.create([
        { student: studentUser._id, subject: 'Math', subjectCode: 'MA101', status: 'Present', date: new Date('2026-08-01'), markedBy: teacherUser._id },
        { student: studentUser._id, subject: 'Math', subjectCode: 'MA101', status: 'Present', date: new Date('2026-08-02'), markedBy: teacherUser._id },
        { student: studentUser._id, subject: 'Math', subjectCode: 'MA101', status: 'Absent', date: new Date('2026-08-03'), markedBy: teacherUser._id },
        { student: studentUser._id, subject: 'Math', subjectCode: 'MA101', status: 'Absent', date: new Date('2026-08-04'), markedBy: teacherUser._id }
      ]);
    });

    it('should retrieve student stats showing 50% attendance rate (< 75% defaulter threshold)', async () => {
      const res = await request(app)
        .get(`/api/attendance/stats/${studentUser._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalClasses).toBe(4);
      expect(res.body.data.present).toBe(2);
      expect(res.body.data.absent).toBe(2);
      expect(res.body.data.percentage).toBe(50.0);
    });

    it('should allow student to fetch their own attendance records', async () => {
      const res = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(4);
    });
  });

  describe('PUT & DELETE /api/attendance/:id', () => {
    let testRecord;

    beforeEach(async () => {
      testRecord = await Attendance.create({
        student: studentUser._id,
        subject: 'Database Systems',
        subjectCode: 'CS301',
        status: 'Absent',
        date: new Date(),
        markedBy: teacherUser._id
      });
    });

    it('should update attendance status from Absent to Present', async () => {
      const res = await request(app)
        .put(`/api/attendance/${testRecord._id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'Present', notes: 'Corrected status after review' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Present');
      expect(res.body.data.notes).toBe('Corrected status after review');
    });

    it('should delete attendance record', async () => {
      const res = await request(app)
        .delete(`/api/attendance/${testRecord._id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Attendance.findById(testRecord._id);
      expect(deleted).toBeNull();
    });
  });
});
