const mongoose = require('mongoose');

const studentEnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify student']
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Please specify academic year']
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Please specify semester']
    },
    department: {
      type: String,
      required: [true, 'Please specify department']
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Division'
    },
    divisionName: {
      type: String,
      default: ''
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Enrolled', 'Promoted', 'Graduated', 'Dropped'],
      default: 'Enrolled'
    },
    promotedAt: {
      type: Date
    },
    promotedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentEnrollment'
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

module.exports = mongoose.model('StudentEnrollment', studentEnrollmentSchema);
