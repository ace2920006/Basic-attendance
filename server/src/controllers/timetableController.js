const Timetable = require('../models/Timetable');
const { notifyTimetableChanged } = require('../services/notificationService');

const DEFAULT_TIMETABLE_ITEMS = [
  {
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    timeSlot: '09:00 AM - 10:30 AM',
    subject: 'Database Management Systems',
    subjectCode: 'CS401',
    room: 'Lab 301',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Dr. John Smith',
    color: '#6366f1'
  },
  {
    day: 'Monday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    timeSlot: '11:00 AM - 12:30 PM',
    subject: 'Web Application Development',
    subjectCode: 'CS403',
    room: 'Room 204',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Dr. Sarah Jenkins',
    color: '#10b981'
  },
  {
    day: 'Monday',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    timeSlot: '02:00 PM - 03:30 PM',
    subject: 'Computer Networks',
    subjectCode: 'CS404',
    room: 'Hall B',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Prof. Alan Turing',
    color: '#f59e0b'
  },
  {
    day: 'Tuesday',
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    timeSlot: '09:30 AM - 11:00 AM',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS402',
    room: 'Lab 102',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Prof. Sarah Connor',
    color: '#06b6d4'
  },
  {
    day: 'Tuesday',
    startTime: '11:30 AM',
    endTime: '01:00 PM',
    timeSlot: '11:30 AM - 01:00 PM',
    subject: 'Operating Systems',
    subjectCode: 'CS405',
    room: 'Room 305',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Dr. Linus Torvalds',
    color: '#f43f5e'
  },
  {
    day: 'Wednesday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    timeSlot: '09:00 AM - 10:30 AM',
    subject: 'Web Application Development',
    subjectCode: 'CS403',
    room: 'Room 204',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Dr. Sarah Jenkins',
    color: '#10b981'
  },
  {
    day: 'Wednesday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    timeSlot: '11:00 AM - 12:30 PM',
    subject: 'Computer Networks',
    subjectCode: 'CS404',
    room: 'Hall B',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Prof. Alan Turing',
    color: '#f59e0b'
  },
  {
    day: 'Thursday',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    timeSlot: '10:00 AM - 11:30 AM',
    subject: 'Operating Systems',
    subjectCode: 'CS405',
    room: 'Room 305',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Dr. Linus Torvalds',
    color: '#f43f5e'
  },
  {
    day: 'Thursday',
    startTime: '01:30 PM',
    endTime: '03:00 PM',
    timeSlot: '01:30 PM - 03:00 PM',
    subject: 'Database Management Systems',
    subjectCode: 'CS401',
    room: 'Lab 301',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Dr. John Smith',
    color: '#6366f1'
  },
  {
    day: 'Friday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    timeSlot: '09:00 AM - 10:30 AM',
    subject: 'Computer Networks Lab',
    subjectCode: 'CS404L',
    room: 'Lab 202',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Prof. Alan Turing',
    color: '#8b5cf6'
  },
  {
    day: 'Friday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    timeSlot: '11:00 AM - 12:30 PM',
    subject: 'Web Application Development',
    subjectCode: 'CS403',
    room: 'Room 204',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Dr. Sarah Jenkins',
    color: '#10b981'
  },
  {
    day: 'Saturday',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    timeSlot: '10:00 AM - 12:00 PM',
    subject: 'Seminar & Capstone Project',
    subjectCode: 'CS400',
    room: 'Auditorium A',
    department: 'Computer Science & Engineering',
    section: 'Sec A',
    instructor: 'Dr. Sarah Jenkins',
    color: '#ec4899'
  }
];

const seedDefaultIfEmpty = async () => {
  const count = await Timetable.countDocuments();
  if (count === 0) {
    await Timetable.insertMany(DEFAULT_TIMETABLE_ITEMS);
  }
};

const getDayName = (date = new Date()) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// @desc    Get all timetable slots with optional filters
// @route   GET /api/timetable
// @access  Private
const getTimetables = async (req, res) => {
  try {
    await seedDefaultIfEmpty();

    const { day, department, section, instructorId, search } = req.query;
    const filter = {};

    if (day) filter.day = day;
    if (department) filter.department = department;
    if (section) filter.section = section;
    if (instructorId) filter.instructorId = instructorId;

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { room: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }

    const timetable = await Timetable.find(filter).sort({ startTime: 1 });
    res.json({
      success: true,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Today's timetable slots
// @route   GET /api/timetable/today
// @access  Private
const getTodayTimetable = async (req, res) => {
  try {
    await seedDefaultIfEmpty();

    const targetDay = req.query.day || getDayName();
    const timetable = await Timetable.find({ day: targetDay }).sort({ startTime: 1 });

    res.json({
      success: true,
      day: targetDay,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Tomorrow's timetable slots
// @route   GET /api/timetable/tomorrow
// @access  Private
const getTomorrowTimetable = async (req, res) => {
  try {
    await seedDefaultIfEmpty();

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDay = getDayName(tomorrowDate);

    const timetable = await Timetable.find({ day: tomorrowDay }).sort({ startTime: 1 });

    res.json({
      success: true,
      day: tomorrowDay,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Weekly timetable organized by days
// @route   GET /api/timetable/weekly
// @access  Private
const getWeeklyTimetable = async (req, res) => {
  try {
    await seedDefaultIfEmpty();

    const allSlots = await Timetable.find({}).sort({ startTime: 1 });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeklyData = {};

    days.forEach((d) => {
      weeklyData[d] = allSlots.filter((slot) => slot.day === d);
    });

    res.json({
      success: true,
      data: weeklyData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new timetable slot
// @route   POST /api/timetable
// @access  Private (Teacher, Admin)
const createTimetable = async (req, res) => {
  try {
    const {
      day,
      startTime,
      endTime,
      subject,
      subjectCode,
      room,
      department,
      course,
      semester,
      section,
      instructor,
      color
    } = req.body;

    if (!day || !startTime || !endTime || !subject || !subjectCode || !room) {
      return res.status(400).json({
        success: false,
        message: 'Please provide day, startTime, endTime, subject, subjectCode, and room'
      });
    }

    const timeSlot = req.body.timeSlot || `${startTime} - ${endTime}`;

    const newSlot = await Timetable.create({
      day,
      startTime,
      endTime,
      timeSlot,
      subject,
      subjectCode,
      room,
      department: department || 'Computer Science & Engineering',
      course: course || 'B.Tech Computer Science',
      semester: semester || 'Semester 4',
      section: section || 'Sec A',
      instructor: instructor || req.user?.name || 'Dr. Sarah Jenkins',
      instructorId: req.user?._id,
      color: color || '#6366f1'
    });

    // Multi-channel notification for new timetable slot
    notifyTimetableChanged({
      department: newSlot.department,
      course: newSlot.course,
      semester: newSlot.semester,
      section: newSlot.section,
      subject: newSlot.subject,
      changeType: 'Scheduled',
      slotDetails: newSlot
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: newSlot,
      message: 'Timetable entry scheduled successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update timetable slot
// @route   PUT /api/timetable/:id
// @access  Private (Teacher, Admin)
const updateTimetable = async (req, res) => {
  try {
    let slot = await Timetable.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    if (req.body.startTime && req.body.endTime) {
      req.body.timeSlot = `${req.body.startTime} - ${req.body.endTime}`;
    }

    slot = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Multi-channel notification for updated timetable slot
    notifyTimetableChanged({
      department: slot.department,
      course: slot.course,
      semester: slot.semester,
      section: slot.section,
      subject: slot.subject,
      changeType: 'Rescheduled',
      slotDetails: slot
    }).catch(() => {});

    res.json({
      success: true,
      data: slot,
      message: 'Timetable entry updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete timetable slot
// @route   DELETE /api/timetable/:id
// @access  Private (Teacher, Admin)
const deleteTimetable = async (req, res) => {
  try {
    const slot = await Timetable.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    // Multi-channel notification for cancelled timetable slot
    notifyTimetableChanged({
      department: slot.department,
      course: slot.course,
      semester: slot.semester,
      section: slot.section,
      subject: slot.subject,
      changeType: 'Cancelled',
      slotDetails: slot
    }).catch(() => {});

    await slot.deleteOne();

    res.json({
      success: true,
      message: 'Timetable entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTimetables,
  getTodayTimetable,
  getTomorrowTimetable,
  getWeeklyTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable
};
