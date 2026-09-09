const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    leaveType: {
      type: String,
      enum: ['Medical', 'Personal Emergency', 'Official Event', 'Duty Leave'],
      default: 'Medical',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    documentUrl: {
      type: String,
      default: ''
    },
    documentName: {
      type: String,
      default: ''
    },
    document: {
      originalName: { type: String, default: '' },
      storedName: { type: String, default: '' },
      filePath: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 },
      hash: { type: String, default: '' }, // SHA-256 Checksum
      scanStatus: {
        type: String,
        enum: ['CLEAN', 'FLAGGED', 'QUARANTINED', 'PENDING'],
        default: 'PENDING'
      },
      scanEngine: { type: String, default: 'Antigravity Heuristic Engine' },
      scanDetails: { type: String, default: '' },
      scannedAt: { type: Date }
    },
    // Overall Application Status
    status: {
      type: String,
      enum: ['Pending', 'Teacher Verified', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    // Multi-stage verification progression
    verificationStage: {
      type: String,
      enum: ['submitted', 'teacher_review', 'admin_verification', 'completed', 'rejected'],
      default: 'teacher_review'
    },
    appliedOn: {
      type: Date,
      default: Date.now
    },
    // Teacher Review Stage
    teacherReview: {
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reviewedAt: {
        type: Date
      },
      remarks: {
        type: String,
        default: ''
      }
    },
    // Admin Final Verification Stage
    adminVerification: {
      status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: {
        type: Date
      },
      remarks: {
        type: String,
        default: ''
      }
    },
    // Backward compatibility fields
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Virtual for backward-compatible document url resolution
leaveSchema.virtual('privateAccessUrl').get(function () {
  return `/api/leaves/${this._id}/document`;
});

module.exports = mongoose.model('Leave', leaveSchema);

