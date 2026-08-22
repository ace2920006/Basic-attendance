/**
 * Input Validation Middleware
 * Provides payload validation rules and schema sanitation for endpoints.
 */

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email.trim());
};

const validatePasswordStrength = (password) => {
  if (typeof password !== 'string') return false;
  // Password must be at least 6 characters
  return password.length >= 6;
};

const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

// Middleware: Validate Registration Payload
const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required');
  }

  if (!email || !validateEmail(email)) {
    errors.push('A valid university email address is required');
  }

  if (!password || !validatePasswordStrength(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !['student', 'teacher', 'admin'].includes(role)) {
    errors.push('Invalid user role specified');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Middleware: Validate Login Payload
const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Middleware: Validate Password Change / Reset Payload
const validatePasswordChange = (req, res, next) => {
  const { password, newPassword } = req.body || {};
  const passToTest = newPassword || password;
  const errors = [];

  if (!passToTest || !validatePasswordStrength(passToTest)) {
    errors.push('New password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Middleware: Validate Mongo ObjectId parameter
const validateParamId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID parameter format for ${paramName}`
      });
    }
    next();
  };
};

module.exports = {
  validateEmail,
  validatePasswordStrength,
  isValidObjectId,
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateParamId
};
