/**
 * Audit Logging Middleware & Utility
 * Asynchronously records administrative operations, security triggers,
 * and user authentication logs without interrupting request lifecycle.
 */

const AuditLog = require('../models/AuditLog');

const recordAuditLog = async ({
  req,
  user = null,
  action = 'SYSTEM_EVENT',
  resource = 'General',
  status = 'SUCCESS',
  details = {}
}) => {
  try {
    const activeUser = user || (req && req.user) || null;
    const ipAddress =
      (req && (req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress)) ||
      '127.0.0.1';
    const userAgent = (req && req.headers['user-agent']) || 'Unknown';
    const method = (req && req.method) || 'N/A';
    const endpoint = (req && (req.originalUrl || req.url)) || 'N/A';

    await AuditLog.create({
      user: activeUser ? activeUser._id || activeUser.id : null,
      userRole: activeUser ? activeUser.role : 'anonymous',
      userName: activeUser ? activeUser.name : (details.email || 'Guest / Anonymous'),
      userEmail: activeUser ? activeUser.email : (details.email || 'N/A'),
      action,
      resource,
      method,
      endpoint,
      ipAddress,
      userAgent,
      status,
      details
    });
  } catch (error) {
    // Non-blocking console output if audit recording encounters an issue
    console.error('Audit Log Recording Error:', error.message);
  }
};

/**
 * Express middleware helper to automatically log state-modifying HTTP actions (POST, PUT, DELETE)
 */
const autoAuditLogger = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const originalEnd = res.end;
    res.end = function (...args) {
      originalEnd.apply(res, args);

      // Only auto-log if not health check or auth endpoint (which log specifically)
      if (
        !req.originalUrl.includes('/api/health') &&
        !req.originalUrl.includes('/api/audit-logs')
      ) {
        const status = res.statusCode < 400 ? 'SUCCESS' : 'FAILED';
        recordAuditLog({
          req,
          action: `${req.method}_${req.baseUrl.replace('/api/', '').toUpperCase()}`,
          resource: req.baseUrl.replace('/api/', '') || 'General',
          status,
          details: { statusCode: res.statusCode }
        });
      }
    };
  }
  next();
};

module.exports = {
  recordAuditLog,
  autoAuditLogger
};
