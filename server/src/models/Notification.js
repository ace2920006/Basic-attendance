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
      enum: ['ATTENDANCE_MARKED', 'CLASS_CANCELLED', 'LOW_ATTENDANCE', 'LEAVE_STATUS', 'ANNOUNCEMENT', 'GENERAL'],
      default: 'GENERAL'
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

