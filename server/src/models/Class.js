const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
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
    section: {
      type: String,
      default: 'Sec A',
      trim: true
    },
    room: {
      type: String,
      required: true,
      trim: true
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      default: 'Computer Science'
    },
    instructor: {
      type: String,
      default: ''
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    studentsCount: {
      type: Number,
      default: 40
    },
    marked: {
      type: Boolean,
      default: false
    },
    present: {
      type: Number,
      default: 0
    },
    absent: {
      type: Number,
      default: 0
    },
    late: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Class', classSchema);
