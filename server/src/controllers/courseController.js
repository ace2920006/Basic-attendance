const asyncHandler = require('../utils/asyncHandler');
const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const filter = {};
  if (department) filter.department = department;

  const courses = await Course.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json({
    success: true,
    data: course
  });
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
  const { name, code, department, durationYears, totalSemesters, description } = req.body;

  if (!name || !code || !department) {
    res.status(400);
    throw new Error('Please provide course name, code, and department');
  }

  const existingCourse = await Course.findOne({ code: code.toUpperCase() });
  if (existingCourse) {
    res.status(400);
    throw new Error('Course with this code already exists');
  }

  const course = await Course.create({
    name,
    code: code.toUpperCase(),
    department,
    durationYears: durationYears || 4,
    totalSemesters: totalSemesters || 8,
    description: description || ''
  });

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  course.name = req.body.name || course.name;
  course.code = req.body.code ? req.body.code.toUpperCase() : course.code;
  course.department = req.body.department || course.department;
  course.durationYears = req.body.durationYears || course.durationYears;
  course.totalSemesters = req.body.totalSemesters || course.totalSemesters;
  course.description = req.body.description !== undefined ? req.body.description : course.description;

  const updatedCourse = await course.save();

  res.json({
    success: true,
    data: updatedCourse
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  await course.deleteOne();

  res.json({
    success: true,
    message: 'Course removed successfully'
  });
});

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
