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

// @desc    Delete a class session
// @route   DELETE /api/classes/:id
// @access  Private (Teacher/Admin)
const deleteClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    res.status(404);
    throw new Error('Class session not found');
  }

  await classItem.deleteOne();

  res.json({
    success: true,
    message: 'Class session removed successfully'
  });
});

module.exports = {
  getClasses,
  createClass,
  deleteClass
};
