const asyncHandler = require('../utils/asyncHandler');
const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ createdAt: -1 });

  // Dynamically calculate actual totals if available
  const result = await Promise.all(
    departments.map(async (dep) => {
      const studentCount = await User.countDocuments({ role: 'student', department: dep.name });
      const teacherCount = await User.countDocuments({ role: 'teacher', department: dep.name });
      return {
        ...dep.toObject(),
        totalStudents: studentCount || dep.totalStudents || 0,
        totalTeachers: teacherCount || dep.totalTeachers || 0
      };
    })
  );

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  res.json({
    success: true,
    data: department
  });
});

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, head, description } = req.body;

  if (!name || !code) {
    res.status(400);
    throw new Error('Please provide department name and short code');
  }

  const existingDept = await Department.findOne({ code: code.toUpperCase() });
  if (existingDept) {
    res.status(400);
    throw new Error('Department code already exists');
  }

  const department = await Department.create({
    name,
    code: code.toUpperCase(),
    head: head || '',
    totalStudents: 0,
    totalTeachers: 0,
    avgAttendance: 85.0
  });

  res.status(201).json({
    success: true,
    data: department
  });
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  department.name = req.body.name || department.name;
  department.code = req.body.code ? req.body.code.toUpperCase() : department.code;
  department.head = req.body.head !== undefined ? req.body.head : department.head;

  const updatedDepartment = await department.save();

  res.json({
    success: true,
    data: updatedDepartment
  });
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  await department.deleteOne();

  res.json({
    success: true,
    message: 'Department removed successfully'
  });
});

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
