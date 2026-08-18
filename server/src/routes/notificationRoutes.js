const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendAnnouncement,
  registerFCMToken
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUserNotifications);
router.put('/read-all', markAllNotificationsAsRead);
router.put('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);
router.post('/fcm-token', registerFCMToken);

// Announcements (Teachers and Admins only)
router.post('/announcement', authorize('teacher', 'admin'), sendAnnouncement);

module.exports = router;
