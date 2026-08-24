const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student'
    },
    avatar: {
      type: String,
      default: ''
    },
    rollNo: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering'
    },
    course: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      default: ''
    },
    semester: {
      type: String,
      default: ''
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear'
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester'
    },
    divisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Division'
    },
    divisionName: {
      type: String,
      default: ''
    },
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      }
    ],
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Warning'],
      default: 'Active'
    },
    refreshToken: {
      type: String,
      default: ''
    },
    lastDeviceFingerprint: {
      type: String,
      default: ''
    },
    lastBrowserId: {
      type: String,
      default: ''
    },
    lastLoginAt: {
      type: Date
    },
    fcmTokens: [
      {
        type: String
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt pre-save hook
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
