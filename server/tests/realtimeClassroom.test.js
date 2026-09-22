const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Class = require('../src/models/Class');
const AttendanceSession = require('../src/models/AttendanceSession');
const Attendance = require('../src/models/Attendance');
const { generateAccessToken } = require('../src/utils/generateToken');

describe('Phase 35: Real-Time Classroom Mode Tests', () => {
  let teacherToken;
  let studentToken;
  let teacherUser;
  let studentUser;
  let testClass;

  beforeEach(async () => {
    await User.deleteMany({});
    await Class.deleteMany({});
    await AttendanceSession.deleteMany({});
    await Attendance.deleteMany({});

    // Create teacher
    teacherUser = await User.create({
      name: 'Prof. Alan Turing',
      email: 'alan.turing@university.edu',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science'
    });
    teacherToken = generateAccessToken(teacherUser._id, teacherUser.role);

    // Create student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Alex Rivera',
      email: 'alex.rivera@student.edu',
      password: 'password123',
      role: 'student',
      rollNo: 'CS-2026-042',
      department: 'Computer Science'
    });
    studentToken = studentRes.body.data.accessToken;
    studentUser = studentRes.body.data;

    // Create class: Database Systems, 10:00 - 11:00, 55 students
    testClass = await Class.create({
      subject: 'Database Systems',
      subjectCode: 'CS401',
      section: 'Sec A',
      room: '302-B',
      timeSlot: '10:00 - 11:00',
      department: 'Computer Science',
      instructor: teacherUser.name,
      instructorId: teacherUser._id,
      studentsCount: 55
    });
  });

  test('POST /api/sessions/start should initialize Real-Time Classroom session with Database Systems 10:00 - 11:00', async () => {
    const res = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        classId: testClass._id,
        subject: 'Database Systems',
        subjectCode: 'CS401',
        timeSlot: '10:00 - 11:00',
        totalStudents: 55,
        mode: 'QR'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject).toBe('Database Systems');
    expect(res.body.data.timeSlot).toBe('10:00 - 11:00');
    expect(res.body.data.stats.totalStudents).toBe(55);
    expect(res.body.data.stats.presentCount).toBe(0);
    expect(res.body.data.status).toBe('Active');
  });

  test('GET /api/sessions/active should indicate hasCheckedIn is false initially for student', async () => {
    // Start session
    await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId: testClass._id });

    const res = await request(app)
      .get('/api/sessions/active')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.active).toBe(true);
    expect(res.body.hasCheckedIn).toBe(false);
    expect(res.body.data.subject).toBe('Database Systems');
    expect(res.body.data.timeSlot).toBe('10:00 - 11:00');
  });

  test('POST /api/sessions/:id/checkin should record student attendance and update presentCount', async () => {
    // 1. Teacher starts session
    const startRes = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId: testClass._id, totalStudents: 55 });

    const sessionId = startRes.body.data._id;

    // 2. Student checks in
    const checkinRes = await request(app)
      .post(`/api/sessions/${sessionId}/checkin`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    expect(checkinRes.statusCode).toBe(201);
    expect(checkinRes.body.success).toBe(true);
    expect(checkinRes.body.stats.presentCount).toBe(1);
    expect(checkinRes.body.stats.totalStudents).toBe(55);
    expect(checkinRes.body.hasCheckedIn).toBe(true);

    // 3. Re-check active session for student
    const activeRes = await request(app)
      .get('/api/sessions/active')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(activeRes.statusCode).toBe(200);
    expect(activeRes.body.hasCheckedIn).toBe(true);
    expect(activeRes.body.data.stats.presentCount).toBe(1);

    // 4. Duplicate check-in attempt should return alreadyCheckedIn
    const dupRes = await request(app)
      .post(`/api/sessions/${sessionId}/checkin`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    expect(dupRes.statusCode).toBe(200);
    expect(dupRes.body.alreadyCheckedIn).toBe(true);
  });

  test('POST /api/sessions/:id/simulate-checkin should increment presentCount live', async () => {
    const startRes = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId: testClass._id, totalStudents: 55 });

    const sessionId = startRes.body.data._id;

    const simRes = await request(app)
      .post(`/api/sessions/${sessionId}/simulate-checkin`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ studentName: 'Maya Lin', rollNo: 'CS-2026-088' });

    expect(simRes.statusCode).toBe(200);
    expect(simRes.body.success).toBe(true);
    expect(simRes.body.stats.presentCount).toBe(1);
    expect(simRes.body.latestStudent.name).toBe('Maya Lin');
  });

  test('POST /api/sessions/:id/stop should complete session and update status', async () => {
    const startRes = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId: testClass._id });

    const sessionId = startRes.body.data._id;

    const stopRes = await request(app)
      .post(`/api/sessions/${sessionId}/stop`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(stopRes.statusCode).toBe(200);
    expect(stopRes.body.data.status).toBe('Completed');
    expect(stopRes.body.data.endTime).toBeDefined();

    // Active session should now be false
    const activeRes = await request(app)
      .get('/api/sessions/active')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(activeRes.statusCode).toBe(200);
    expect(activeRes.body.active).toBe(false);
  });
});
