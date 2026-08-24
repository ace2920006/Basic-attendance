const asyncHandler = require('../utils/asyncHandler');
const Class = require('../models/Class');
const User = require('../models/User');

// @desc    Get all classes assigned or created
// @route   GET /api/classes
// @access  Private
const getClasses = asyncHandler(async (req, res) => {
  const { instructorId, department, search } = req.query;
  const filter = {};

  if (instructorId) filter.instructorId = instructorId;
  if (department) filter.department = department;

  if (req.user.role === 'teacher') {
    filter.$or = [
      { instructorId: req.user._id },
      { instructor: req.user.name }
    ];
  }

  if (search) {
    filter.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { subjectCode: { $regex: search, $options: 'i' } },
      { room: { $regex: search, $options: 'i' } }
    ];
  }

  const classes = await Class.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: classes.length,
    data: classes
  });
});

// @desc    Create a new class session / schedule
// @route   POST /api/classes
// @access  Private (Teacher/Admin)
const createClass = asyncHandler(async (req, res) => {
  const { subject, subjectCode, section, room, timeSlot, department, studentsCount } = req.body;

  if (!subject || !subjectCode || !room || !timeSlot) {
    res.status(400);
    throw new Error('Please provide subject name, subject code, room, and time slot');
  }

  const instructorName = req.user ? req.user.name : 'Faculty Member';
  const instructorId = req.user ? req.user._id : null;

  const newClass = await Class.create({
    subject,
    subjectCode: subjectCode.toUpperCase(),
    section: section || 'Sec A',
    room,
    timeSlot,
    department: department || req.user?.department || 'Computer Science',
    instructor: instructorName,
    instructorId,
    studentsCount: studentsCount || 40,
    marked: false,
    present: 0,
    absent: 0,
    late: 0
  });

  res.status(201).json({
    success: true,
    data: newClass
  });
});

const { sendNotification } = require('../config/socket');

// @desc    Delete a class session
// @route   DELETE /api/classes/:id
// @access  Private (Teacher/Admin)
const deleteClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    res.status(404);
    throw new Error('Class session not found');
  }

  // Trigger Class Cancelled real-time notification to students
  sendNotification({
    department: classItem.department,
    role: 'student',
    title: 'Class Cancelled',
    message: `Notice: ${classItem.subject} (${classItem.subjectCode}) scheduled for ${classItem.timeSlot || 'today'} in Room ${classItem.room} has been cancelled.`,
    type: 'warning',
    eventType: 'CLASS_CANCELLED',
    data: {
      subject: classItem.subject,
      subjectCode: classItem.subjectCode,
      room: classItem.room,
      timeSlot: classItem.timeSlot
    }
  });

  await classItem.deleteOne();

  res.json({
    success: true,
    message: 'Class session removed successfully and cancellation alert sent'
  });
});

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// @desc    Start QR Attendance session (generates dynamic 30-sec token)
// @route   POST /api/classes/:id/start-qr
// @access  Private (Teacher/Admin)
const startQRAttendance = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  if (!classItem) {
    res.status(404);
    throw new Error('Class session not found');
  }

  const { latitude, longitude, maxRadiusMeters } = req.body;
  if (latitude !== undefined && longitude !== undefined) {
    classItem.campusLocation = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      maxRadiusMeters: Number(maxRadiusMeters) || 500
    };
  }

  const nonce = crypto.randomBytes(8).toString('hex');
  const token = jwt.sign(
    {
      classId: classItem._id,
      subjectCode: classItem.subjectCode,
      subject: classItem.subject,
      nonce
    },
    process.env.JWT_SECRET,
    { expiresIn: '30s' }
  );

  classItem.qrActive = true;
  classItem.qrSecretToken = token;
  classItem.qrExpiresAt = new Date(Date.now() + 30000);
  await classItem.save();

  res.json({
    success: true,
    message: 'QR Attendance session started',
    token,
    expiresAt: classItem.qrExpiresAt,
    campusLocation: classItem.campusLocation
  });
});

// @desc    Get or auto-rotate active 30s QR session token
// @route   GET /api/classes/:id/qr-token
// @access  Private (Teacher/Admin/Student)
const getQRSessionToken = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  if (!classItem) {
    res.status(404);
    throw new Error('Class session not found');
  }

  if (!classItem.qrActive) {
    res.status(400);
    throw new Error('QR Attendance is not active for this class');
  }

  // Generate a fresh 30-second token if current is expired or missing
  const now = new Date();
  if (!classItem.qrExpiresAt || classItem.qrExpiresAt <= now || !classItem.qrSecretToken) {
    const nonce = crypto.randomBytes(8).toString('hex');
    classItem.qrSecretToken = jwt.sign(
      {
        classId: classItem._id,
        subjectCode: classItem.subjectCode,
        subject: classItem.subject,
        nonce
      },
      process.env.JWT_SECRET,
      { expiresIn: '30s' }
    );
    classItem.qrExpiresAt = new Date(Date.now() + 30000);
    await classItem.save();
  }

  res.json({
    success: true,
    token: classItem.qrSecretToken,
    expiresAt: classItem.qrExpiresAt,
    campusLocation: classItem.campusLocation
  });
});

// @desc    Stop QR Attendance session
// @route   POST /api/classes/:id/stop-qr
// @access  Private (Teacher/Admin)
const stopQRAttendance = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  if (!classItem) {
    res.status(404);
    throw new Error('Class session not found');
  }

  classItem.qrActive = false;
  classItem.qrSecretToken = '';
  await classItem.save();

  res.json({
    success: true,
    message: 'QR Attendance session stopped'
  });
});

module.exports = {
  getClasses,
  createClass,
  deleteClass,
  startQRAttendance,
  getQRSessionToken,
  stopQRAttendance
};
