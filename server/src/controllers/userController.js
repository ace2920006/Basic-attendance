const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { recordAuditLog, AUDIT_ACTIONS } = require('../middleware/auditMiddleware');

// @desc    Get all users with optional filtering
// @route   GET /api/users
// @access  Private (Admin/Teacher)
const getUsers = asyncHandler(async (req, res) => {
  const { role, department, status, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNo: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .populate('assignedSubjects', 'name code department color')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('assignedSubjects', 'name code department color');

  if (user) {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Create a new user (Admin created)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNo, department, course, designation, semester } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const userRole = role || 'student';

  const user = await User.create({
    name,
    email,
    password: password || '123456',
    role: userRole,
    rollNo: rollNo || '',
    department: department || 'Computer Science & Engineering',
    course: course || '',
    designation: designation || '',
    semester: semester || ''
  });

  const auditAction = userRole === 'student' ? AUDIT_ACTIONS.CREATE_STUDENT : AUDIT_ACTIONS.CREATE_USER;

  await recordAuditLog({
    req,
    user: req.user,
    targetUser: user._id,
    targetUserName: user.name,
    targetUserRollNo: user.rollNo,
    action: auditAction,
    resource: 'Users',
    status: 'SUCCESS',
    details: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNo: user.rollNo,
      department: user.department,
      semester: user.semester,
      createdBy: req.user?._id
    }
  });

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.department = req.body.department || user.department;
    user.course = req.body.course !== undefined ? req.body.course : user.course;
    user.rollNo = req.body.rollNo || user.rollNo;
    user.designation = req.body.designation || user.designation;
    user.semester = req.body.semester || user.semester;
    user.status = req.body.status || user.status;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    await recordAuditLog({
      req,
      user: req.user,
      targetUser: updatedUser._id,
      targetUserName: updatedUser.name,
      targetUserRollNo: updatedUser.rollNo,
      action: AUDIT_ACTIONS.CHANGE_SETTINGS,
      resource: 'Users',
      status: 'SUCCESS',
      details: {
        settingType: 'User Account Details',
        targetUserId: updatedUser._id,
        targetName: updatedUser.name,
        targetRole: updatedUser.role,
        updatedFields: Object.keys(req.body).filter((k) => k !== 'password')
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Assign Subjects to User (Student/Teacher)
// @route   POST /api/users/:id/assign-subjects
// @access  Private/Admin
const assignSubjectsToUser = asyncHandler(async (req, res) => {
  const { subjectIds } = req.body; // Array of Subject ObjectIds
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!Array.isArray(subjectIds)) {
    res.status(400);
    throw new Error('subjectIds must be an array');
  }

  user.assignedSubjects = subjectIds;
  await user.save();

  const updatedUser = await User.findById(user._id)
    .select('-password')
    .populate('assignedSubjects', 'name code department color');

  await recordAuditLog({
    req,
    user: req.user,
    targetUser: updatedUser._id,
    targetUserName: updatedUser.name,
    action: AUDIT_ACTIONS.CHANGE_SETTINGS,
    resource: 'Subject Allocations',
    status: 'SUCCESS',
    details: {
      settingType: 'Subject Allocation',
      targetUserId: updatedUser._id,
      targetName: updatedUser.name,
      subjectCount: subjectIds.length
    }
  });

  res.json({
    success: true,
    message: 'Subjects assigned successfully',
    data: updatedUser
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    const isStudent = user.role === 'student';
    const auditAction = isStudent ? AUDIT_ACTIONS.DELETE_STUDENT : AUDIT_ACTIONS.DELETE_USER;

    await recordAuditLog({
      req,
      user: req.user,
      targetUser: user._id,
      targetUserName: user.name,
      targetUserRollNo: user.rollNo,
      action: auditAction,
      resource: 'Users',
      status: 'SUCCESS',
      details: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
        department: user.department,
        deletedBy: req.user?._id
      }
    });

    await user.deleteOne();
    res.json({
      success: true,
      message: `${isStudent ? 'Student' : 'User'} removed successfully`
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  assignSubjectsToUser,
  deleteUser
};
