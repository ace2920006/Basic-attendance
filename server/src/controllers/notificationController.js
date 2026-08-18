const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotification } = require('../config/socket');

// @desc    Get logged in user's notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, limit = 50 } = req.query;
  const filter = { recipient: req.user._id };

  if (unreadOnly === 'true') {
    filter.unread = true;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10));

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    unread: true
  });

  res.json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications
  });
});

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }

  notification.unread = false;
  await notification.save();

  res.json({
    success: true,
    data: notification
  });
});

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, unread: true },
    { $set: { unread: false } }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Send broadcast announcement (Admin / Teacher)
// @route   POST /api/notifications/announcement
// @access  Private (Teacher/Admin)
const sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, targetRole, department, type = 'info' } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error('Please provide title and message for announcement');
  }

  const senderName = req.user.name;
  const formattedTitle = `📢 Announcement: ${title}`;
  const formattedMessage = `${message} (Posted by ${senderName})`;

  const result = await sendNotification({
    recipientId: null,
    role: targetRole || null,
    department: department || null,
    title: formattedTitle,
    message: formattedMessage,
    type,
    eventType: 'ANNOUNCEMENT',
    data: {
      postedBy: senderName,
      targetRole,
      department
    }
  });

  res.status(201).json({
    success: true,
    message: 'Announcement broadcasted successfully',
    data: result
  });
});

// @desc    Register FCM Push Token for Web Push
// @route   POST /api/notifications/fcm-token
// @access  Private
const registerFCMToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('FCM token is required');
  }

  const user = await User.findById(req.user._id);
  if (!user.fcmTokens) {
    user.fcmTokens = [];
  }

  if (!user.fcmTokens.includes(token)) {
    user.fcmTokens.push(token);
    await user.save();
  }

  res.json({
    success: true,
    message: 'FCM push token registered successfully'
  });
});

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendAnnouncement,
  registerFCMToken
};
