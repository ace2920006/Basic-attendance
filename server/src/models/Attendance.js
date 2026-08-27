const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    subjectCode: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused', 'On Leave', 'Holiday', 'Cancelled Lecture'],
      required: true,
      default: 'Present'
    },
    arrivalTime: {
      type: String,
      default: ''
    },
    departureTime: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationMethod: {
      type: String,
      enum: ['Manual', 'QR', 'GPS'],
      default: 'Manual'
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceSession'
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      distanceMeters: { type: Number },
      isWithinBounds: { type: Boolean, default: true }
    },
    deviceInfo: {
      browserId: { type: String, default: '' },
      deviceFingerprint: { type: String, default: '' },
      ipAddress: { type: String, default: '' },
      userAgent: { type: String, default: '' }
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ['Normal', 'Suspicious', 'High Risk'],
      default: 'Normal'
    },
    riskSignals: [
      {
        signal: {
          type: String,
          enum: ['QR Token', 'GPS', 'Time', 'Device', 'IP', 'Pattern']
        },
        status: {
          type: String,
          enum: ['PASSED', 'WARNING', 'FLAGGED']
        },
        scoreContribution: { type: Number, default: 0 },
        reason: { type: String, default: '' }
      }
    ],
    reviewStatus: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Approved'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    reviewNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
