const mongoose = require('mongoose');

const statusConfigSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Present', 'Absent', 'Late', 'Excused', 'On Leave', 'Holiday', 'Cancelled Lecture']
    },
    label: {
      type: String,
      required: true
    },
    countsAsAttended: {
      type: Boolean,
      default: false
    },
    countsAsConducted: {
      type: Boolean,
      default: true
    },
    attendanceWeight: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1.0
    },
    badgeColor: {
      type: String,
      default: '#6B7280'
    },
    description: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const attendanceRuleSchema = new mongoose.Schema(
  {
    minAttendancePercentage: {
      type: Number,
      required: true,
      default: 75,
      min: 0,
      max: 100
    },
    lateThresholdMinutes: {
      type: Number,
      required: true,
      default: 10,
      min: 0
    },
    gracePeriodMinutes: {
      type: Number,
      required: true,
      default: 5,
      min: 0
    },
    qrValidityMinutes: {
      type: Number,
      required: true,
      default: 1,
      min: 0.1
    },
    gpsRadiusMeters: {
      type: Number,
      required: true,
      default: 100,
      min: 1
    },
    autoMarkAbsentMinutes: {
      type: Number,
      default: 30,
      min: 0
    },
    allowStudentSelfCheckIn: {
      type: Boolean,
      default: true
    },
    consecutiveAbsentAlertThreshold: {
      type: Number,
      default: 3,
      min: 1
    },
    statusConfigs: {
      type: [statusConfigSchema],
      default: [
        {
          status: 'Present',
          label: 'Present',
          countsAsAttended: true,
          countsAsConducted: true,
          attendanceWeight: 1.0,
          badgeColor: '#10B981',
          description: 'On time attendance'
        },
        {
          status: 'Absent',
          label: 'Absent',
          countsAsAttended: false,
          countsAsConducted: true,
          attendanceWeight: 0.0,
          badgeColor: '#EF4444',
          description: 'Unexcused absence'
        },
        {
          status: 'Late',
          label: 'Late Arrival',
          countsAsAttended: true,
          countsAsConducted: true,
          attendanceWeight: 0.8,
          badgeColor: '#F59E0B',
          description: 'Arrived past grace period but within late cutoff'
        },
        {
          status: 'Excused',
          label: 'Excused Absence',
          countsAsAttended: true,
          countsAsConducted: true,
          attendanceWeight: 1.0,
          badgeColor: '#8B5CF6',
          description: 'Approved official representation or medical exception'
        },
        {
          status: 'On Leave',
          label: 'On Approved Leave',
          countsAsAttended: false,
          countsAsConducted: false,
          attendanceWeight: 0.0,
          badgeColor: '#3B82F6',
          description: 'Approved leave of absence (excluded from conducted count)'
        },
        {
          status: 'Holiday',
          label: 'Institutional Holiday',
          countsAsAttended: false,
          countsAsConducted: false,
          attendanceWeight: 0.0,
          badgeColor: '#6B7280',
          description: 'Scheduled holiday (excluded from attendance denominator)'
        },
        {
          status: 'Cancelled Lecture',
          label: 'Cancelled Lecture',
          countsAsAttended: false,
          countsAsConducted: false,
          attendanceWeight: 0.0,
          badgeColor: '#EC4899',
          description: 'Lecture cancelled by faculty/institution (excluded)'
        }
      ]
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AttendanceRule', attendanceRuleSchema);
