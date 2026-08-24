const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a semester name (e.g., Semester 5)'],
      trim: true
    },
    semesterNumber: {
      type: Number,
      required: [true, 'Please specify semester number (1-10)'],
      min: 1,
      max: 10
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Please link semester to an Academic Year']
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate semester names under the same academic year
semesterSchema.index({ name: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
