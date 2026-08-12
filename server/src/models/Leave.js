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
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    appliedOn: {
      type: Date,
      default: Date.now
    },
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

module.exports = mongoose.model('Leave', leaveSchema);
