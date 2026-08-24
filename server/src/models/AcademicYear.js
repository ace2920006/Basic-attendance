const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    yearName: {
      type: String,
      required: [true, 'Please provide an Academic Year name (e.g., 2026-27)'],
      unique: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date']
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date']
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed', 'Archived'],
      default: 'Active'
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one academic year is marked as current if set
academicYearSchema.pre('save', async function () {
  if (this.isModified('isCurrent') && this.isCurrent) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isCurrent: false } }
    );
  }
});

module.exports = mongoose.model('AcademicYear', academicYearSchema);
