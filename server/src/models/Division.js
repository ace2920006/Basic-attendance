const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please specify division name (e.g., IT-A)'],
      trim: true
    },
    section: {
      type: String,
      required: [true, 'Please specify section (e.g., A, B, C)'],
      trim: true,
      uppercase: true
    },
    department: {
      type: String,
      required: [true, 'Please specify department code or name'],
      trim: true
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Please link division to an Academic Year']
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Please link division to a Semester']
    },
    capacity: {
      type: Number,
      default: 60
    },
    studentsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate division names under the same semester & department
divisionSchema.index({ name: 1, semester: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Division', divisionSchema);
