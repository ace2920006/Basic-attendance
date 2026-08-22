const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
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
    action: {
      type: String,
      required: true,
      index: true
    },
    resource: {
      type: String,
      default: 'System'
    },
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
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Index for fast query filtering
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userRole: 1, status: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
