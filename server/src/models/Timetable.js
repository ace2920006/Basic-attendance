const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      trim: true
    },
    startTime: {
      type: String,
      required: true,
      trim: true
    },
    endTime: {
      type: String,
      required: true,
      trim: true
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true
    },
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
    room: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    course: {
      type: String,
      default: 'B.Tech Computer Science',
      trim: true
    },
    semester: {
      type: String,
      default: 'Semester 4',
      trim: true
    },
    section: {
      type: String,
      default: 'Sec A',
      trim: true
    },
    instructor: {
      type: String,
      default: '',
      trim: true
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    color: {
      type: String,
      default: '#6366f1'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Timetable', timetableSchema);
