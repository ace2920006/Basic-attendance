/**
 * Audit Logging Middleware & Utility
 * Asynchronously records administrative operations, security triggers,
 * user authentication logs, attendance transitions, and institutional modifications.
 */

const AuditLog = require('../models/AuditLog');

const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE_STUDENT: 'CREATE_STUDENT',
  DELETE_STUDENT: 'DELETE_STUDENT',
  MARK_ATTENDANCE: 'MARK_ATTENDANCE',
  EDIT_ATTENDANCE: 'EDIT_ATTENDANCE',
  APPROVE_LEAVE: 'APPROVE_LEAVE',
  REJECT_LEAVE: 'REJECT_LEAVE',
  EXPORT_REPORT: 'EXPORT_REPORT',
  CHANGE_SETTINGS: 'CHANGE_SETTINGS',
  CREATE_USER: 'CREATE_USER',
  DELETE_USER: 'DELETE_USER',
  ATTENDANCE_CORRECTION_REQUESTED: 'ATTENDANCE_CORRECTION_REQUESTED',
  ATTENDANCE_CORRECTION_APPROVED: 'ATTENDANCE_CORRECTION_APPROVED',
  ATTENDANCE_CORRECTION_REJECTED: 'ATTENDANCE_CORRECTION_REJECTED',
  RBAC_VIOLATION: 'RBAC_VIOLATION'
};

const recordAuditLog = async ({
  req = null,
  user = null,
  targetUser = null,
  targetUserName = '',
  targetUserRollNo = '',
  action = 'SYSTEM_EVENT',
  resource = 'General',
  originalValue = '',
  newValue = '',
  transition = '',
  reason = '',
  status = 'SUCCESS',
  details = {}
}) => {
  try {
    if (req) {
      req._auditLogged = true;
    }

    const activeUser = user || (req && req.user) || null;
    const ipAddress =
      (req && (req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress)) ||
      '127.0.0.1';
    const userAgent = (req && req.headers['user-agent']) || 'Unknown';
    const method = (req && req.method) || 'N/A';
    const endpoint = (req && (req.originalUrl || req.url)) || 'N/A';

    // Compute transition string if original & new values are provided but transition wasn't
    const computedTransition = transition || (originalValue && newValue ? `${originalValue} → ${newValue}` : '');
    const computedReason = reason || details.reason || details.notes || '';

    await AuditLog.create({
      user: activeUser ? activeUser._id || activeUser.id : null,
      userRole: activeUser ? activeUser.role : 'anonymous',
      userName: activeUser ? activeUser.name : (details.email || details.userName || 'Guest / Anonymous'),
      userEmail: activeUser ? activeUser.email : (details.email || 'N/A'),
      targetUser: targetUser ? (targetUser._id || targetUser.id || targetUser) : null,
      targetUserName: targetUserName || (targetUser && targetUser.name) || details.studentName || '',
      targetUserRollNo: targetUserRollNo || (targetUser && targetUser.rollNo) || details.studentRollNo || '',
      action,
      resource,
      originalValue: originalValue || details.originalStatus || details.oldStatus || '',
      newValue: newValue || details.requestedStatus || details.newStatus || '',
      transition: computedTransition,
      reason: computedReason,
      method,
      endpoint,
      ipAddress,
      userAgent,
      status,
      details: {
        ...details,
        ...(computedReason ? { reason: computedReason } : {}),
        ...(computedTransition ? { transition: computedTransition } : {})
      }
    });
  } catch (error) {
    // Non-blocking console output if audit recording encounters an issue
    console.error('Audit Log Recording Error:', error.message);
  }
};

/**
 * Express middleware helper to automatically log unhandled state-modifying HTTP actions (POST, PUT, DELETE)
 */
const autoAuditLogger = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const originalEnd = res.end;
    res.end = function (...args) {
      originalEnd.apply(res, args);

      // Only auto-log if not already explicitly logged, not health check, and not audit-logs fetch
      if (
        !req._auditLogged &&
        !req.originalUrl.includes('/api/health') &&
        !req.originalUrl.includes('/api/audit-logs')
      ) {
        const status = res.statusCode < 400 ? 'SUCCESS' : 'FAILED';
        recordAuditLog({
          req,
          action: `${req.method}_${(req.baseUrl || '').replace('/api/', '').toUpperCase() || 'SYSTEM'}`,
          resource: (req.baseUrl || '').replace('/api/', '') || 'General',
          status,
          details: { statusCode: res.statusCode }
        });
      }
    };
  }
  next();
};

module.exports = {
  AUDIT_ACTIONS,
  recordAuditLog,
  autoAuditLogger
};
