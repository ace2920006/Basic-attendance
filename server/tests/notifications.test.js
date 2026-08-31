const request = require('supertest');
const app = require('../src/app');
const Notification = require('../src/models/Notification');
const User = require('../src/models/User');

const { generateAccessToken } = require('../src/utils/generateToken');
const {
  calculateSmartAttendanceAdvice,
  notifyAttendanceMarked,
  notifyLowAttendance,
  notifyLeaveApproved,
  notifyLeaveRejected,
  notifyAnnouncement,
  notifyClassCancelled,
  notifyTimetableChanged
} = require('../src/services/notificationService');

describe('🔔 Phase 25: Advanced Notification Engine Test Suite', () => {
  let studentToken, studentUser, teacherToken, teacherUser;

  beforeEach(async () => {
    // Teacher
    teacherUser = await User.create({
      name: 'Teacher Notifier',
      email: 'teacher.notifier@example.com',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science & Engineering'
    });
    teacherToken = generateAccessToken(teacherUser._id, teacherUser.role);

    // Student
    const sRes = await request(app).post('/api/auth/register').send({
      name: 'Student Receiver',
      email: 'student.receiver@example.com',
      password: 'password123',
      role: 'student',
      rollNo: 'CS202608'
    });
    studentToken = sRes.body.data.accessToken;
    studentUser = sRes.body.data;
  });

  describe('GET & Management of Notifications', () => {
    let mockNotification;

    beforeEach(async () => {
      mockNotification = await Notification.create({
        recipient: studentUser._id,
        title: 'Attendance Marked',
        message: 'You were marked Present for Cyber Security.',
        type: 'success',
        eventType: 'ATTENDANCE_MARKED',
        channelsSent: ['in_app', 'email', 'push'],
        unread: true
      });
    });

    it('should fetch logged-in user notifications and unread count', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.unreadCount).toBe(1);
      expect(res.body.data[0].title).toBe('Attendance Marked');
      expect(res.body.data[0].channelsSent).toContain('in_app');
    });

    it('should mark a specific notification as read', async () => {
      const res = await request(app)
        .put(`/api/notifications/${mockNotification._id}/read`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unread).toBe(false);
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const count = await Notification.countDocuments({ recipient: studentUser._id, unread: true });
      expect(count).toBe(0);
    });

    it('should delete a notification', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${mockNotification._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Notification.findById(mockNotification._id);
      expect(deleted).toBeNull();
    });
  });

  describe('⚡ Smart Notification Advice Formula Unit Tests', () => {
    it('should accurately calculate consecutive lectures needed when below 75% threshold', () => {
      // Example from specification: Database Systems attendance at 72% (18/25).
      // Consecutive attended needed to reach 75%:
      // (18 + x) / (25 + x) >= 0.75 => x >= (0.75*25 - 18)/(1 - 0.75) = (18.75 - 18)/0.25 = 0.75/0.25 = 3
      const advice = calculateSmartAttendanceAdvice({
        currentPercentage: 72,
        minPercentage: 75,
        attendedLectures: 18,
        totalLectures: 25,
        subjectName: 'Database Systems'
      });

      expect(advice.isDefaulter).toBe(true);
      expect(advice.currentPercentage).toBe(72);
      expect(advice.targetPercentage).toBe(75);
      expect(advice.lecturesNeeded).toBeGreaterThanOrEqual(1);
      expect(advice.actionableText).toContain('Database Systems attendance has fallen to 72%');
      expect(advice.actionableText).toContain('consecutive attended');
      expect(advice.actionableText).toContain('to reach 75%');
    });

    it('should calculate safe miss buffer when student is above 75% threshold', () => {
      // Attended: 18 out of 20 = 90%. Target: 75%.
      // y <= (18 / 0.75) - 20 = 24 - 20 = 4 safe misses
      const advice = calculateSmartAttendanceAdvice({
        currentPercentage: 90,
        minPercentage: 75,
        attendedLectures: 18,
        totalLectures: 20,
        subjectName: 'Web Application Development'
      });

      expect(advice.isDefaulter).toBe(false);
      expect(advice.safeMisses).toBe(4);
      expect(advice.lecturesNeeded).toBe(0);
      expect(advice.actionableText).toContain('safely miss up to 4 upcoming');
    });
  });

  describe('📢 Domain Events Multi-Channel Dispatching', () => {
    it('should dispatch Attendance Marked notification across channels', async () => {
      const notifs = await notifyAttendanceMarked({
        studentId: studentUser._id,
        subject: 'Database Management Systems',
        subjectCode: 'CS401',
        status: 'Present'
      });

      expect(notifs).toBeDefined();
      expect(notifs.length).toBe(1);
      expect(notifs[0].eventType).toBe('ATTENDANCE_MARKED');
      expect(notifs[0].channelsSent).toContain('in_app');
      expect(notifs[0].title).toContain('Attendance Marked');
    });

    it('should dispatch Smart Low Attendance warning notification with advice attached', async () => {
      const notifs = await notifyLowAttendance({
        studentId: studentUser._id,
        subject: 'Database Systems',
        currentPercentage: 72,
        minPercentage: 75,
        attendedLectures: 18,
        totalLectures: 25
      });

      expect(notifs).toBeDefined();
      expect(notifs.length).toBe(1);
      expect(notifs[0].eventType).toBe('LOW_ATTENDANCE');
      expect(notifs[0].smartAdvice).toBeDefined();
      expect(notifs[0].smartAdvice.actionableText).toContain('reach 75%');
    });

    it('should dispatch Leave Approved and Leave Rejected notifications', async () => {
      const approved = await notifyLeaveApproved({
        studentId: studentUser._id,
        leaveType: 'Medical',
        startDate: 'Sep 1, 2026',
        endDate: 'Sep 3, 2026',
        remarks: 'Approved by HoD'
      });
      expect(approved[0].eventType).toBe('LEAVE_APPROVED');
      expect(approved[0].type).toBe('success');

      const rejected = await notifyLeaveRejected({
        studentId: studentUser._id,
        leaveType: 'Personal',
        startDate: 'Sep 1, 2026',
        endDate: 'Sep 1, 2026',
        remarks: 'Exam on same date'
      });
      expect(rejected[0].eventType).toBe('LEAVE_REJECTED');
      expect(rejected[0].type).toBe('error');
    });

    it('should broadcast Announcement, Class Cancelled, and Timetable Changed', async () => {
      const ann = await notifyAnnouncement({
        title: 'Midterm Timetable',
        message: 'Midterm examination starts next Monday',
        targetRole: 'student'
      });
      expect(ann).toBeDefined();

      const cancel = await notifyClassCancelled({
        department: 'Computer Science & Engineering',
        subject: 'Computer Networks',
        room: 'Lab 202',
        timeSlot: '02:00 PM - 03:30 PM'
      });
      expect(cancel).toBeDefined();

      const tt = await notifyTimetableChanged({
        department: 'Computer Science & Engineering',
        subject: 'Operating Systems',
        changeType: 'Rescheduled',
        slotDetails: { day: 'Friday', timeSlot: '11:00 AM - 12:30 PM' }
      });
      expect(tt).toBeDefined();
    });
  });

  describe('⚙️ User Notification Preferences & Testing Sandbox', () => {
    it('should get and update user notification preferences', async () => {
      const getRes = await request(app)
        .get('/api/notifications/preferences')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.preferences.channels.inApp).toBe(true);

      const putRes = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          channels: { email: false },
          events: { timetableChanged: false }
        });

      expect(putRes.status).toBe(200);
      expect(putRes.body.success).toBe(true);
      expect(putRes.body.data.channels.email).toBe(false);
      expect(putRes.body.data.events.timetableChanged).toBe(false);
    });

    it('should execute test-dispatch endpoint simulator', async () => {
      const res = await request(app)
        .post('/api/notifications/test-dispatch')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          eventType: 'LOW_ATTENDANCE',
          subject: 'Database Systems',
          currentPercentage: 72,
          minPercentage: 75
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should retrieve student Smart Attendance Summary breakdown', async () => {
      const res = await request(app)
        .get('/api/notifications/smart-summary')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.minAttendancePercentage).toBe(75);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('FCM Web Push & Campus Announcement API', () => {
    it('should register FCM web push token for logged-in user', async () => {
      const res = await request(app)
        .post('/api/notifications/fcm-token')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          token: 'fcm_mock_token_abcdef123456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const user = await User.findById(studentUser._id);
      expect(user.fcmTokens).toContain('fcm_mock_token_abcdef123456');
    });

    it('should allow teacher to broadcast campus announcement notification', async () => {
      const res = await request(app)
        .post('/api/notifications/announcement')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Campus Holiday Announcement',
          message: 'The campus will be closed tomorrow due to heavy rain.',
          targetRole: 'student'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
