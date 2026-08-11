const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      default: 'Computer Science'
    },
    course: {
      type: String,
      default: ''
    },
    instructor: {
      type: String,
      default: ''
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    totalClasses: {
      type: Number,
      default: 30
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

module.exports = mongoose.model('Subject', subjectSchema);
