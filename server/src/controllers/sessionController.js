const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AttendanceSession = require('../models/AttendanceSession');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const { getSystemRules } = require('../utils/attendanceRulesEngine');

// Helper to generate a unique readable Session ID
const generateSessionIdCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SESS-${dateStr}-${randomHex}`;
};

// @desc    Start a new Attendance Session for a Class
// @route   POST /api/sessions/start
// @access  Private (Teacher/Admin)
const startSession = asyncHandler(async (req, res) => {
  const { classId, mode, latitude, longitude, maxRadiusMeters } = req.body;

  if (!classId) {
    res.status(400);
    throw new Error('Please provide a classId to start an attendance session');
  }

  const classItem = await Class.findById(classId);
  if (!classItem) {
    res.status(404);
    throw new Error('Class session not found');
  }

  const rules = await getSystemRules();
  const validitySeconds = Math.max(15, Math.round((rules.qrValidityMinutes || 1) * 60));
  const defaultGpsRadius = rules.gpsRadiusMeters || 100;

  // Complete any prior active session for this class
  await AttendanceSession.updateMany(
    { class: classId, status: 'Active' },
    { status: 'Completed', endTime: new Date() }
  );

  const sessionIdCode = generateSessionIdCode();
  const nonce = crypto.randomBytes(8).toString('hex');

  const campusLocation = {
    latitude: latitude !== undefined ? Number(latitude) : (classItem.campusLocation?.latitude || 28.6139),
    longitude: longitude !== undefined ? Number(longitude) : (classItem.campusLocation?.longitude || 77.2090),
    maxRadiusMeters: Number(maxRadiusMeters) || classItem.campusLocation?.maxRadiusMeters || defaultGpsRadius
  };

  const newSession = await AttendanceSession.create({
    sessionId: sessionIdCode,
    class: classItem._id,
    subject: classItem.subject,
    subjectCode: classItem.subjectCode,
    division: classItem.section || 'Sec A',
    teacher: req.user._id,
    teacherName: req.user.name,
    department: classItem.department || req.user.department || 'Computer Science',
    room: classItem.room || '',
    startTime: new Date(),
    mode: mode || 'QR',
    status: 'Active',
    campusLocation,
    stats: {
      totalStudents: classItem.studentsCount || 40,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0
    }
  });

  const qrSecretToken = jwt.sign(
    {
      sessionId: newSession._id,
      sessionIdCode: newSession.sessionId,
      classId: classItem._id,
      subjectCode: classItem.subjectCode,
      subject: classItem.subject,
      nonce
    },
    process.env.JWT_SECRET,
    { expiresIn: `${validitySeconds}s` }
  );

  newSession.qrSecretToken = qrSecretToken;
  newSession.qrExpiresAt = new Date(Date.now() + validitySeconds * 1000);
  await newSession.save();

  // Also update Class item for backward compatibility
  classItem.qrActive = true;
  classItem.qrSecretToken = qrSecretToken;
  classItem.qrExpiresAt = newSession.qrExpiresAt;
  classItem.campusLocation = campusLocation;
  await classItem.save();

  res.status(201).json({
    success: true,
    message: 'Attendance Session started successfully',
    data: newSession,
    token: qrSecretToken,
    validitySeconds
  });
});

// @desc    Get active attendance session for a class or teacher
// @route   GET /api/sessions/active
// @access  Private
const getActiveSession = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const filter = { status: 'Active' };

  if (classId) {
    filter.class = classId;
  } else if (req.user.role === 'teacher') {
    filter.teacher = req.user._id;
  }

  const session = await AttendanceSession.findOne(filter).sort({ createdAt: -1 });

  if (!session) {
    return res.json({
      success: true,
      active: false,
      data: null
    });
  }

  res.json({
    success: true,
    active: true,
    data: session
  });
});

// @desc    Get or rotate active QR token for session
// @route   GET /api/sessions/:id/qr-token
// @access  Private
const getSessionQRToken = asyncHandler(async (req, res) => {
  const session = await AttendanceSession.findById(req.params.id);
  if (!session) {
    res.status(404);
    throw new Error('Attendance Session not found');
  }

  if (session.status !== 'Active') {
    res.status(400);
    throw new Error('This Attendance Session is no longer active');
  }

  const rules = await getSystemRules();
  const validitySeconds = Math.max(15, Math.round((rules.qrValidityMinutes || 1) * 60));
  const now = new Date();

  if (!session.qrExpiresAt || session.qrExpiresAt <= now || !session.qrSecretToken) {
    const nonce = crypto.randomBytes(8).toString('hex');
    session.qrSecretToken = jwt.sign(
      {
        sessionId: session._id,
        sessionIdCode: session.sessionId,
        classId: session.class,
        subjectCode: session.subjectCode,
        subject: session.subject,
        nonce
      },
      process.env.JWT_SECRET,
      { expiresIn: `${validitySeconds}s` }
    );
    session.qrExpiresAt = new Date(Date.now() + validitySeconds * 1000);
    await session.save();

    // Also update Class item
    await Class.findByIdAndUpdate(session.class, {
      qrSecretToken: session.qrSecretToken,
      qrExpiresAt: session.qrExpiresAt,
      qrActive: true
    });
  }

  res.json({
    success: true,
    token: session.qrSecretToken,
    expiresAt: session.qrExpiresAt,
    validitySeconds,
    campusLocation: session.campusLocation,
    session
  });
});

// @desc    Stop / Complete an active Attendance Session
// @route   POST /api/sessions/:id/stop
// @access  Private (Teacher/Admin)
const stopSession = asyncHandler(async (req, res) => {
  const session = await AttendanceSession.findById(req.params.id);
  if (!session) {
    res.status(404);
    throw new Error('Attendance Session not found');
  }

  // Calculate live session attendance stats
  const attendanceRecords = await Attendance.find({ sessionId: session._id });
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  attendanceRecords.forEach((rec) => {
    if (rec.status === 'Present') presentCount++;
    else if (rec.status === 'Absent') absentCount++;
    else if (rec.status === 'Late') lateCount++;
    else if (rec.status === 'Excused') excusedCount++;
  });

  session.status = 'Completed';
  session.endTime = new Date();
  session.stats = {
    totalStudents: session.stats?.totalStudents || 40,
    presentCount,
    absentCount,
    lateCount,
    excusedCount
  };
  await session.save();

  // Deactivate QR on Class item
  await Class.findByIdAndUpdate(session.class, {
    qrActive: false,
    qrSecretToken: ''
  });

  res.json({
    success: true,
    message: 'Attendance Session completed successfully',
    data: session
  });
});

// @desc    Get session details and attendance logs
// @route   GET /api/sessions/:id
// @access  Private
const getSessionDetails = asyncHandler(async (req, res) => {
  const session = await AttendanceSession.findById(req.params.id)
    .populate('teacher', 'name email department')
    .populate('class');

  if (!session) {
    res.status(404);
    throw new Error('Attendance Session not found');
  }

  const attendanceLogs = await Attendance.find({ sessionId: session._id })
    .populate('student', 'name rollNo department email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: session,
    attendanceLogs
  });
});

// @desc    List all Attendance Sessions
// @route   GET /api/sessions
// @access  Private
const getAttendanceSessions = asyncHandler(async (req, res) => {
  const { teacherId, classId, status, subjectCode, search } = req.query;
  const filter = {};

  if (teacherId) filter.teacher = teacherId;
  if (classId) filter.class = classId;
  if (status) filter.status = status;
  if (subjectCode) filter.subjectCode = subjectCode.toUpperCase();

  if (req.user.role === 'teacher') {
    filter.teacher = req.user._id;
  }

  if (search) {
    filter.$or = [
      { sessionId: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { subjectCode: { $regex: search, $options: 'i' } },
      { division: { $regex: search, $options: 'i' } }
    ];
  }

  const sessions = await AttendanceSession.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({
    success: true,
    count: sessions.length,
    data: sessions
  });
});

module.exports = {
  startSession,
  getActiveSession,
  getSessionQRToken,
  stopSession,
  getSessionDetails,
  getAttendanceSessions
};
