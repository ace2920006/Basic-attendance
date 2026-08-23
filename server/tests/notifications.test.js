const request = require('supertest');
const app = require('../src/app');
const Notification = require('../src/models/Notification');
const User = require('../src/models/User');

describe('🔔 Notifications Module Test Suite', () => {
  let studentToken, studentUser, teacherToken, teacherUser;

  beforeEach(async () => {
    // Teacher
    const tRes = await request(app).post('/api/auth/register').send({
      name: 'Teacher Notifier',
      email: 'teacher.notifier@example.com',
      password: 'password123',
      role: 'teacher'
    });
    teacherToken = tRes.body.data.accessToken;
    teacherUser = tRes.body.data;

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

  describe('FCM Web Push & Campus Announcement', () => {
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
