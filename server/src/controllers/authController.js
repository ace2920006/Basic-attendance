const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { recordAuditLog } = require('../middleware/auditMiddleware');
const sendEmail = require('../utils/sendEmail');

/**
 * SHA-256 Hash helper for refresh token server-side session security
 */
const hashToken = (token) => {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Helper to set HTTP-Only secure refresh token cookie
 */
const sendRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @desc    Register a new user (Public - forced to 'student' role)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, rollNo, department, designation, semester } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    recordAuditLog({
      req,
      action: 'REGISTER_FAILED_EXISTS',
      resource: 'Auth',
      status: 'FAILED',
      details: { email, message: 'Email address already registered' }
    });
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Security Hardening Fix #1: Public self-registration is strictly forced to 'student' role.
  // Teacher and Admin accounts must be provisioned by an authorized administrator via /api/users.
  const forcedRole = 'student';

  const user = await User.create({
    name,
    email,
    password,
    role: forcedRole,
    rollNo: rollNo || '',
    department: department || 'Computer Science & Engineering',
    designation: designation || '',
    semester: semester || ''
  });

  if (user) {
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshTokenVal = generateRefreshToken(user._id);

    // Security Hardening Fix #4: Store refresh token as SHA-256 hash in database
    user.refreshToken = hashToken(refreshTokenVal);
    await user.save({ validateBeforeSave: false });

    // Security Hardening Fix #5: Transport refresh token via secure HTTP-Only cookie
    sendRefreshTokenCookie(res, refreshTokenVal);

    recordAuditLog({
      req,
      user,
      action: 'USER_REGISTERED',
      resource: 'Auth',
      status: 'SUCCESS',
      details: { role: user.role, email: user.email }
    });

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
        refreshToken: refreshTokenVal
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
    const refreshTokenVal = generateRefreshToken(user._id);

    // Security Hardening Fix #4: Store SHA-256 hashed refresh token in DB
    user.refreshToken = hashToken(refreshTokenVal);
    await user.save({ validateBeforeSave: false });

    // Security Hardening Fix #5: Set HTTP-Only Cookie
    sendRefreshTokenCookie(res, refreshTokenVal);

    recordAuditLog({
      req,
      user,
      action: 'USER_LOGIN',
      resource: 'Auth',
      status: 'SUCCESS',
      details: { role: user.role, email: user.email }
    });

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
        refreshToken: refreshTokenVal
      }
    });
  } else {
    recordAuditLog({
      req,
      action: 'LOGIN_FAILED',
      resource: 'Auth',
      status: 'FAILED',
      details: { email, message: 'Invalid credentials provided' }
    });
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear refresh token & HTTP-only cookie
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

  // Clear HTTP-Only cookie
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Refresh Access Token using HTTP-Only cookie or token string
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  // Support HTTP-Only Cookie first, fallback to req.body.refreshToken for API client compatibility
  const reqRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!reqRefreshToken) {
    res.status(401);
    throw new Error('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(
      reqRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  const hashedIncomingToken = hashToken(reqRefreshToken);

  // Match hashed token stored in DB or fallback direct match for legacy sessions
  if (!user || (user.refreshToken !== hashedIncomingToken && user.refreshToken !== reqRefreshToken)) {
    res.status(401);
    throw new Error('Invalid refresh token session');
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  // Hash new refresh token before saving to DB
  user.refreshToken = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  // Update HTTP-Only cookie
  sendRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success: true,
    data: {
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  });
});

// @desc    Forgot Password - Send reset token / link via Nodemailer email provider
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with that email address');
  }

  // Get reset token & save SHA-256 hashed token in DB
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const message = `You are receiving this email because a password reset request was submitted for your AttendPro account.\n\nPlease click the link below or paste it into your browser to reset your password:\n\n${resetUrl}\n\nThis reset token expires in 10 minutes. If you did not request a password reset, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 16px;">
      <h2 style="color: #6366f1; margin-bottom: 10px;">AttendPro Password Reset Request 🛡️</h2>
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        Hello <strong>${user.name}</strong>,<br/><br/>
        A password reset request was initiated for your AttendPro account (<strong>${user.email}</strong>).
      </p>
      <div style="margin: 25px 0; text-align: center;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Reset Password Now</a>
      </div>
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
        Or copy and paste this reset link into your browser:<br/>
        <a href="${resetUrl}" style="color: #38bdf8; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="font-size: 11px; color: #64748b; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        This token is valid for 10 minutes. If you did not request a password reset, no action is required.
      </p>
    </div>
  `;

  // Security Hardening Fix #3: Dispatch reset email via Nodemailer provider
  try {
    await sendEmail({
      email: user.email,
      subject: 'AttendPro Account Password Reset',
      message,
      html
    });

    res.json({
      success: true,
      message: 'Password reset link sent to your registered email address',
      resetToken,
      resetUrl
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error(`Email could not be sent: ${err.message}`);
  }
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

  // Hash incoming reset token
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

  // Hash new refresh token before saving
  user.refreshToken = hashToken(refreshTokenVal);
  await user.save();

  // Set HTTP-Only Cookie
  sendRefreshTokenCookie(res, refreshTokenVal);

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
