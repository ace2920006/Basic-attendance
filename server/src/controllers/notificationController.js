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

// @desc    Get user notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notificationPreferences email');

  const defaultPreferences = {
    channels: {
      inApp: true,
      email: true,
      push: true
    },
    events: {
      attendanceMarked: true,
      lowAttendance: true,
      leaveStatus: true,
      announcements: true,
      timetableChanged: true,
      classCancelled: true
    }
  };

  const preferences = user?.notificationPreferences || defaultPreferences;

  res.json({
    success: true,
    data: {
      email: user?.email,
      preferences
    }
  });
});

// @desc    Update user notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { channels, events } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.notificationPreferences) {
    user.notificationPreferences = {};
  }

  if (channels) {
    user.notificationPreferences.channels = {
      ...user.notificationPreferences.channels,
      ...channels
    };
  }

  if (events) {
    user.notificationPreferences.events = {
      ...user.notificationPreferences.events,
      ...events
    };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Notification preferences updated successfully',
    data: user.notificationPreferences
  });
});

// @desc    Test Notification Dispatch (Multi-Channel Simulation)
// @route   POST /api/notifications/test-dispatch
// @access  Private
const testDispatchNotification = asyncHandler(async (req, res) => {
  const {
    eventType = 'LOW_ATTENDANCE',
    subject = 'Database Systems',
    currentPercentage = 72,
    minPercentage = 75,
    channels = ['in_app', 'email', 'push'],
    customTitle,
    customMessage
  } = req.body;

  const {
    dispatchNotification,
    calculateSmartAttendanceAdvice,
    notifyAttendanceMarked,
    notifyLowAttendance,
    notifyLeaveApproved,
    notifyLeaveRejected,
    notifyAnnouncement,
    notifyClassCancelled,
    notifyTimetableChanged
  } = require('../services/notificationService');

  let result;
  const targetId = req.user._id;

  switch (eventType) {
    case 'ATTENDANCE_MARKED':
      result = await notifyAttendanceMarked({
        studentId: targetId,
        subject,
        subjectCode: 'CS401',
        status: 'Present',
        timeSlot: '09:00 AM - 10:30 AM'
      });
      break;

    case 'LOW_ATTENDANCE':
      result = await notifyLowAttendance({
        studentId: targetId,
        subject,
        subjectCode: 'CS401',
        currentPercentage: Number(currentPercentage) || 72,
        minPercentage: Number(minPercentage) || 75,
        attendedLectures: 18,
        totalLectures: 25
      });
      break;

    case 'LEAVE_APPROVED':
      result = await notifyLeaveApproved({
        studentId: targetId,
        leaveType: 'Medical',
        startDate: 'Tomorrow',
        endDate: 'Friday',
        remarks: 'Doctor certificate verified',
        reviewerName: req.user.name || 'Faculty Advisor'
      });
      break;

    case 'LEAVE_REJECTED':
      result = await notifyLeaveRejected({
        studentId: targetId,
        leaveType: 'Personal Leave',
        startDate: 'Tomorrow',
        endDate: 'Tomorrow',
        remarks: 'Exam session scheduled on this date',
        reviewerName: req.user.name || 'Faculty Advisor'
      });
      break;

    case 'ANNOUNCEMENT':
      result = await notifyAnnouncement({
        title: customTitle || 'Campus Midterm Schedule Released',
        message: customMessage || 'Midterm examination timetable has been published on the student portal.',
        targetRole: 'all',
        authorName: req.user.name || 'Dean of Academics'
      });
      break;

    case 'CLASS_CANCELLED':
      result = await notifyClassCancelled({
        department: req.user.department || 'Computer Science & Engineering',
        subject,
        subjectCode: 'CS401',
        room: 'Lab 301',
        timeSlot: '09:00 AM - 10:30 AM',
        reason: 'Faculty Development Conference'
      });
      break;

    case 'TIMETABLE_CHANGED':
      result = await notifyTimetableChanged({
        department: req.user.department || 'Computer Science & Engineering',
        subject,
        changeType: 'Rescheduled',
        slotDetails: {
          day: 'Wednesday',
          timeSlot: '11:00 AM - 12:30 PM',
          room: 'Hall B',
          instructor: req.user.name || 'Dr. Sarah Jenkins'
        }
      });
      break;

    default: {
      const advice = calculateSmartAttendanceAdvice({
        currentPercentage: 72,
        minPercentage: 75,
        attendedLectures: 18,
        totalLectures: 25,
        subjectName: subject
      });

      result = await dispatchNotification({
        recipientId: targetId,
        title: customTitle || `⚡ Smart Notification Alert: ${subject}`,
        message: customMessage || advice.actionableText,
        type: 'warning',
        eventType: 'LOW_ATTENDANCE',
        channels,
        smartAdvice: advice,
        data: { subject, currentPercentage: 72, minRequired: 75 }
      });
    }
  }

  res.status(200).json({
    success: true,
    message: `Test notification for event "${eventType}" dispatched across requested channels`,
    data: result
  });
});

// @desc    Get Smart Attendance Summary for logged in student
// @route   GET /api/notifications/smart-summary
// @access  Private (Student)
const getSmartAttendanceSummary = asyncHandler(async (req, res) => {
  const Attendance = require('../models/Attendance');
  const { getSystemRules, calculateAttendanceStats } = require('../utils/attendanceRulesEngine');
  const { calculateSmartAttendanceAdvice } = require('../services/notificationService');

  const rules = await getSystemRules();
  const minPercentage = rules.minAttendancePercentage || 75;

  const records = await Attendance.find({ student: req.user._id });

  // Group records by subject
  const subjectMap = {};
  records.forEach((rec) => {
    const sub = rec.subject || 'General';
    if (!subjectMap[sub]) {
      subjectMap[sub] = [];
    }
    subjectMap[sub].push(rec);
  });

  const subjectSummaries = Object.entries(subjectMap).map(([subName, recs]) => {
    const stats = calculateAttendanceStats(recs, rules);
    const attended = (stats.counts?.Present || 0) + (stats.counts?.Late || 0);
    const total = stats.effectiveTotal || recs.length;

    const smartAdvice = calculateSmartAttendanceAdvice({
      currentPercentage: stats.weightedPercentage,
      minPercentage,
      attendedLectures: attended,
      totalLectures: total,
      subjectName: subName
    });

    return {
      subject: subName,
      subjectCode: recs[0]?.subjectCode || '',
      currentPercentage: stats.weightedPercentage,
      minPercentage,
      attendedLectures: attended,
      totalLectures: total,
      isDefaulter: stats.weightedPercentage < minPercentage,
      smartAdvice
    };
  });

  res.json({
    success: true,
    minAttendancePercentage: minPercentage,
    totalSubjects: subjectSummaries.length,
    defaulterSubjectsCount: subjectSummaries.filter((s) => s.isDefaulter).length,
    data: subjectSummaries
  });
});

module.exports = {
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
};
