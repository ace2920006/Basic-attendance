const mongoose = require('mongoose');

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendance',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    },
    originalStatus: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused', 'On Leave', 'Holiday', 'Cancelled Lecture'],
      required: true
    },
    requestedStatus: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused', 'On Leave', 'Holiday', 'Cancelled Lecture'],
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the attendance correction']
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewComment: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

attendanceCorrectionSchema.index({ attendance: 1, createdAt: -1 });
attendanceCorrectionSchema.index({ status: 1, createdAt: -1 });
attendanceCorrectionSchema.index({ student: 1 });

module.exports = mongoose.model('AttendanceCorrection', attendanceCorrectionSchema);
