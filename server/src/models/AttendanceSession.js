const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    division: {
      type: String,
      default: 'Sec A',
      trim: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    teacherName: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: 'Computer Science'
    },
    room: {
      type: String,
      default: ''
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    mode: {
      type: String,
      enum: ['QR', 'Manual', 'GPS', 'Hybrid'],
      default: 'QR'
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled', 'Expired'],
      default: 'Active'
    },
    qrSecretToken: {
      type: String,
      default: ''
    },
    qrExpiresAt: {
      type: Date
    },
    campusLocation: {
      latitude: {
        type: Number,
        default: 28.6139
      },
      longitude: {
        type: Number,
        default: 77.2090
      },
      maxRadiusMeters: {
        type: Number,
        default: 100
      }
    },
    stats: {
      totalStudents: { type: Number, default: 0 },
      presentCount: { type: Number, default: 0 },
      absentCount: { type: Number, default: 0 },
      lateCount: { type: Number, default: 0 },
      excusedCount: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
