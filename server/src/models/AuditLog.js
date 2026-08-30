const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    // Actor / Performer
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userRole: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'anonymous', 'system'],
      default: 'anonymous'
    },
    userName: {
      type: String,
      default: 'Guest / Anonymous'
    },
    userEmail: {
      type: String,
      default: 'N/A'
    },

    // Target User (if applicable, e.g. Student whose attendance was changed)
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    targetUserName: {
      type: String,
      default: ''
    },
    targetUserRollNo: {
      type: String,
      default: ''
    },

    // Action Classification
    action: {
      type: String,
      required: true,
      index: true
    },
    resource: {
      type: String,
      default: 'System',
      index: true
    },

    // State Mutation & Reason Tracking
    originalValue: {
      type: String,
      default: ''
    },
    newValue: {
      type: String,
      default: ''
    },
    transition: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    },

    // Network & HTTP Context
    method: {
      type: String,
      default: 'GET'
    },
    endpoint: {
      type: String,
      default: '/'
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: 'Unknown'
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'WARNING'],
      default: 'SUCCESS',
      index: true
    },

    // Additional structured details
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast querying, filtering, and reporting
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ targetUser: 1, createdAt: -1 });
auditLogSchema.index({ userRole: 1, status: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
