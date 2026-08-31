const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info'
    },
    eventType: {
      type: String,
      enum: [
        'ATTENDANCE_MARKED',
        'LOW_ATTENDANCE',
        'LEAVE_APPROVED',
        'LEAVE_REJECTED',
        'LEAVE_STATUS',
        'ANNOUNCEMENT',
        'CLASS_CANCELLED',
        'TIMETABLE_CHANGED',
        'ANTI_PROXY_REVIEW',
        'GENERAL'
      ],
      default: 'GENERAL'
    },
    channelsSent: [
      {
        type: String,
        enum: ['in_app', 'email', 'push']
      }
    ],
    smartAdvice: {
      currentPercentage: Number,
      targetPercentage: Number,
      lecturesNeeded: Number,
      safeMisses: Number,
      attendedLectures: Number,
      totalLectures: Number,
      actionableText: String
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    targetRole: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'all', ''],
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    unread: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);

