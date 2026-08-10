const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNo, department, designation, semester } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    rollNo: rollNo || '',
    department: department || 'Computer Science & Engineering',
    designation: designation || '',
    semester: semester || ''
  });

  if (user) {
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        rollNo: user.rollNo,
        department: user.department,
        designation: user.designation,
        semester: user.semester,
        token: accessToken,
        accessToken,
        refreshToken
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        rollNo: user.rollNo,
        department: user.department,
        designation: user.designation,
        semester: user.semester,
        token: accessToken,
        accessToken,
        refreshToken
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = '';
      await user.save({ validateBeforeSave: false });
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: reqRefreshToken } = req.body;

  if (!reqRefreshToken) {
    res.status(401);
    throw new Error('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(
      reqRefreshToken,
      process.env.JWT_REFRESH_SECRET || 'attendance_jwt_refresh_secret_key_2026_spec'
    );
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== reqRefreshToken) {
    res.status(401);
    throw new Error('Invalid refresh token session');
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  });
});

// @desc    Forgot Password - Send reset token / link
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with that email address');
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // In production this sends an email via Nodemailer. For demo/starter, return token & link in JSON payload.
  const resetUrl = `/reset-password?token=${resetToken}`;

  res.json({
    success: true,
    message: 'Password reset token generated successfully',
    resetToken,
    resetUrl
  });
});

// @desc    Reset Password using token
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.params.resettoken || req.body.resetToken;

  if (!resetToken) {
    res.status(400);
    throw new Error('Reset token is required');
  }

  // Hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshTokenVal = generateRefreshToken(user._id);
  user.refreshToken = refreshTokenVal;

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
      accessToken,
      refreshToken: refreshTokenVal
    }
  });
});

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

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

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;
    user.department = req.body.department || user.department;
    user.rollNo = req.body.rollNo || user.rollNo;
    user.semester = req.body.semester || user.semester;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        rollNo: updatedUser.rollNo,
        department: updatedUser.department,
        token: generateAccessToken(updatedUser._id, updatedUser.role)
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
};
