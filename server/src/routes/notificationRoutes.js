const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendAnnouncement,
  registerFCMToken,
  getNotificationPreferences,
  updateNotificationPreferences,
  testDispatchNotification,
  getSmartAttendanceSummary
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUserNotifications);
router.put('/read-all', markAllNotificationsAsRead);
router.put('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);
router.post('/fcm-token', registerFCMToken);

// User notification preferences
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);

// Smart attendance calculations summary
router.get('/smart-summary', getSmartAttendanceSummary);

// Test notification dispatch simulator
router.post('/test-dispatch', testDispatchNotification);

// Announcements (Teachers and Admins only)
router.post('/announcement', authorize('teacher', 'admin'), sendAnnouncement);

module.exports = router;
