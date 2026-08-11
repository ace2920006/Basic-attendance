const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a course code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Please add a course name'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Please specify a department'],
      trim: true
    },
    durationYears: {
      type: Number,
      default: 4
    },
    totalSemesters: {
      type: Number,
      default: 8
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

module.exports = mongoose.model('Course', courseSchema);
