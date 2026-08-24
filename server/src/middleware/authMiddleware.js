const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { recordAuditLog } = require('./auditMiddleware');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        recordAuditLog({
          req,
          action: 'INVALID_TOKEN_USER_NOT_FOUND',
          resource: 'Auth',
          status: 'FAILED',
          details: { message: 'Token valid but associated user account no longer exists' }
        });
        res.status(401);
        throw new Error('User not found with this token');
      }

      next();
    } catch (error) {
      console.error('JWT Verification Failed:', error.message);
      
      const errorMsg = error.name === 'TokenExpiredError' 
        ? 'Session expired, please login again' 
        : 'Not authorized, token validation failed';

      recordAuditLog({
        req,
        action: 'JWT_VERIFICATION_FAILED',
        resource: 'Auth',
        status: 'FAILED',
        details: { errorName: error.name, errorMessage: error.message }
      });

      res.status(401);
      throw new Error(errorMsg);
    }
  }

  if (!token) {
    recordAuditLog({
      req,
      action: 'UNAUTHORIZED_NO_TOKEN',
      resource: 'Auth',
      status: 'FAILED',
      details: { message: 'Missing Authorization header Bearer token' }
    });
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      recordAuditLog({
        req,
        user: req.user,
        action: 'ROLE_AUTHORIZATION_DENIED',
        resource: req.baseUrl || 'RBAC',
        status: 'WARNING',
        details: {
          userRole: req.user.role,
          requiredRoles: roles,
          path: req.originalUrl
        }
      });

      res.status(403);
      throw new Error(
        `Access denied: User role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };

