const mongoose = require('mongoose');

const escalationLogSchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      required: true,
      enum: ['WARNING', 'SERIOUS_WARNING', 'ADMIN_ALERT', 'PARENT_ALERT']
    },
    triggeredAt: {
      type: Date,
      default: Date.now
    },
    actionSummary: {
      type: String,
      required: true
    },
    channels: [
      {
        type: String,
        enum: ['in_app', 'email', 'push', 'sms']
      }
    ],
    recipients: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      default: 'DISPATCHED'
    }
  },
  { _id: false }
);

const defaulterRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    studentRollNo: {
      type: String,
      default: ''
    },
    studentEmail: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: 'General'
    },
    division: {
      type: String,
      default: ''
    },
    course: {
      type: String,
      default: ''
    },
    semester: {
      type: String,
      default: ''
    },
    guardianName: {
      type: String,
      default: ''
    },
    guardianEmail: {
      type: String,
      default: ''
    },
    guardianPhone: {
      type: String,
      default: ''
    },
    attendancePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    attendedClasses: {
      type: Number,
      default: 0
    },
    totalClasses: {
      type: Number,
      default: 0
    },
    classesNeededToTarget: {
      type: Number,
      default: 0
    },
    targetPercentage: {
      type: Number,
      default: 75
    },
    tier: {
      type: String,
      required: true,
      enum: ['WARNING', 'SERIOUS_WARNING', 'ADMIN_ALERT', 'PARENT_ALERT'],
      index: true
    },
    tierLabel: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'under_review'],
      default: 'active',
      index: true
    },
    escalationHistory: [escalationLogSchema],
    warningNotified: {
      type: Boolean,
      default: false
    },
    warningNotifiedAt: {
      type: Date
    },
    seriousNotified: {
      type: Boolean,
      default: false
    },
    seriousNotifiedAt: {
      type: Date
    },
    adminNotified: {
      type: Boolean,
      default: false
    },
    adminNotifiedAt: {
      type: Date
    },
    parentNotified: {
      type: Boolean,
      default: false
    },
    parentNotifiedAt: {
      type: Date
    },
    lastEvaluatedAt: {
      type: Date,
      default: Date.now
    },
    resolutionNotes: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying active defaulters per department and tier
defaulterRecordSchema.index({ department: 1, status: 1, tier: 1 });
defaulterRecordSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('DefaulterRecord', defaulterRecordSchema);
