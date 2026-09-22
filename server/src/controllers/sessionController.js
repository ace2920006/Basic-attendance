const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AttendanceSession = require('../models/AttendanceSession');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const { getSystemRules } = require('../utils/attendanceRulesEngine');
const { broadcastClassroomEvent } = require('../config/socket');

// Helper to generate a unique readable Session ID
const generateSessionIdCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SESS-${dateStr}-${randomHex}`;
};

// @desc    Start a new Attendance Session for a Class (Real-Time Classroom Mode)
// @route   POST /api/sessions/start
// @access  Private (Teacher/Admin)
const startSession = asyncHandler(async (req, res) => {
  const { classId, subject, subjectCode, division, timeSlot, room, totalStudents, mode, latitude, longitude, maxRadiusMeters } = req.body;

  let classItem = null;
  if (classId) {
    classItem = await Class.findById(classId);
  }

  // Fallback to find or create class representation for seamless ad-hoc sessions
  if (!classItem) {
    const targetCode = (subjectCode || 'CS401').toUpperCase();
    classItem = await Class.findOne({ subjectCode: targetCode });
    if (!classItem) {
      classItem = await Class.create({
        subject: subject || 'Database Systems',
        subjectCode: targetCode,
        section: division || 'Sec A',
        room: room || '302-B',
        timeSlot: timeSlot || '10:00 - 11:00',
        department: req.user.department || 'Computer Science',
        instructor: req.user.name,
        instructorId: req.user._id,
        studentsCount: Number(totalStudents) || 55
      });
    }
  }

  const rules = await getSystemRules();
  const validitySeconds = Math.max(15, Math.round((rules.qrValidityMinutes || 1) * 60));
  const defaultGpsRadius = rules.gpsRadiusMeters || 100;

  // Complete any prior active session for this class or teacher
  await AttendanceSession.updateMany(
    {
      $or: [
        { class: classItem._id, status: 'Active' },
        { teacher: req.user._id, status: 'Active' }
      ]
    },
    { status: 'Completed', endTime: new Date() }
  );

  const sessionIdCode = generateSessionIdCode();
  const nonce = crypto.randomBytes(8).toString('hex');

  const campusLocation = {
    latitude: latitude !== undefined ? Number(latitude) : (classItem.campusLocation?.latitude || 28.6139),
    longitude: longitude !== undefined ? Number(longitude) : (classItem.campusLocation?.longitude || 77.2090),
    maxRadiusMeters: Number(maxRadiusMeters) || classItem.campusLocation?.maxRadiusMeters || defaultGpsRadius
  };

  const chosenTimeSlot = timeSlot || classItem.timeSlot || '10:00 - 11:00';
  const chosenTotalStudents = Number(totalStudents) || classItem.studentsCount || 55;

  const newSession = await AttendanceSession.create({
    sessionId: sessionIdCode,
    class: classItem._id,
    subject: subject || classItem.subject || 'Database Systems',
    subjectCode: (subjectCode || classItem.subjectCode || 'CS401').toUpperCase(),
    division: division || classItem.section || 'Sec A',
    timeSlot: chosenTimeSlot,
    teacher: req.user._id,
    teacherName: req.user.name,
    department: classItem.department || req.user.department || 'Computer Science',
    room: room || classItem.room || '302-B',
    startTime: new Date(),
    mode: mode || 'QR',
    status: 'Active',
    campusLocation,
    stats: {
      totalStudents: chosenTotalStudents,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0
    },
    recentCheckins: []
  });

  const qrSecretToken = jwt.sign(
    {
      sessionId: newSession._id,
      sessionIdCode: newSession.sessionId,
      classId: classItem._id,
      subjectCode: newSession.subjectCode,
      subject: newSession.subject,
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

  // Real-Time Classroom Mode: Broadcast live to all connected students via Socket.IO
  const broadcastPayload = {
    sessionId: newSession.sessionId,
    sessionIdMongo: newSession._id,
    classId: classItem._id,
    subject: newSession.subject,
    subjectCode: newSession.subjectCode,
    division: newSession.division,
    timeSlot: newSession.timeSlot,
    room: newSession.room,
    teacherName: newSession.teacherName,
    department: newSession.department,
    startTime: newSession.startTime,
    mode: newSession.mode,
    status: 'Active',
    stats: {
      totalStudents: newSession.stats.totalStudents,
      presentCount: newSession.stats.presentCount
    },
    qrSecretToken: qrSecretToken,
    qrExpiresAt: newSession.qrExpiresAt
  };

  broadcastClassroomEvent('classroom_session_started', broadcastPayload);

  res.status(201).json({
    success: true,
    message: 'Attendance Session started successfully',
    data: newSession,
    token: qrSecretToken,
    validitySeconds
  });
});

// @desc    Get active attendance session for a class or teacher or student
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

  let hasCheckedIn = false;
  let studentAttendance = null;

  if (req.user.role === 'student') {
    studentAttendance = await Attendance.findOne({
      student: req.user._id,
      sessionId: session._id
    });
    hasCheckedIn = !!studentAttendance;
  }

  res.json({
    success: true,
    active: true,
    data: session,
    hasCheckedIn,
    studentAttendance
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
