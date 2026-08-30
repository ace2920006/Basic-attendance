const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all audit logs with pagination & filtering
// @route   GET /api/audit-logs
// @access  Private (Admin)
const getAuditLogs = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    role,
    action,
    resource,
    startDate,
    endDate,
    studentId,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Comprehensive text search matching users, target students, actions, reasons, and transitions
  if (search) {
    query.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { userEmail: { $regex: search, $options: 'i' } },
      { targetUserName: { $regex: search, $options: 'i' } },
      { targetUserRollNo: { $regex: search, $options: 'i' } },
      { action: { $regex: search, $options: 'i' } },
      { resource: { $regex: search, $options: 'i' } },
      { reason: { $regex: search, $options: 'i' } },
      { transition: { $regex: search, $options: 'i' } },
      { ipAddress: { $regex: search, $options: 'i' } },
      { 'details.reason': { $regex: search, $options: 'i' } },
      { 'details.studentName': { $regex: search, $options: 'i' } },
      { 'details.subject': { $regex: search, $options: 'i' } }
    ];
  }

  // Filter criteria
  if (status) query.status = status;
  if (role) query.userRole = role;
  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (studentId) {
    query.$or = [{ targetUser: studentId }, { 'details.studentId': studentId }];
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email role rollNo designation')
      .populate('targetUser', 'name email role rollNo department semester'),
    AuditLog.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: logs.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: logs
  });
});

// @desc    Get audit log metrics & security overview stats
// @route   GET /api/audit-logs/stats
// @access  Private (Admin)
const getAuditLogStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalEvents,
    todayEvents,
    failedEvents,
    warningEvents,
    topActions,
    recentFailures,
    actionBreakdown
  ] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ createdAt: { $gte: startOfToday } }),
    AuditLog.countDocuments({ status: 'FAILED' }),
    AuditLog.countDocuments({ status: 'WARNING' }),
    AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    AuditLog.find({ status: 'FAILED' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('userName userEmail action endpoint ipAddress createdAt'),
    AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Convert array of action counts into key-value map for quick frontend access
  const actionCounts = {};
  actionBreakdown.forEach((item) => {
    actionCounts[item._id] = item.count;
  });

  res.json({
    success: true,
    data: {
      totalEvents,
      todayEvents,
      failedEvents,
      warningEvents,
      actionCounts,
      topActions: topActions.map((item) => ({
        action: item._id,
        count: item.count
      })),
      recentFailures
    }
  });
});

// @desc    Export audit logs to CSV
// @route   GET /api/audit-logs/export
// @access  Private (Admin)
const exportAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(2000);

  let csvContent = 'Timestamp,Actor Name,Actor Email,Actor Role,Action,Target Student,Transition,Reason,Resource,Method,Endpoint,IP Address,Status\n';

  logs.forEach((log) => {
    const timestamp = new Date(log.createdAt).toISOString();
    const name = `"${(log.userName || '').replace(/"/g, '""')}"`;
    const email = `"${(log.userEmail || '').replace(/"/g, '""')}"`;
    const role = log.userRole || '';
    const action = `"${(log.action || '').replace(/"/g, '""')}"`;
    const targetStudent = `"${(log.targetUserName ? `${log.targetUserName}${log.targetUserRollNo ? ` (${log.targetUserRollNo})` : ''}` : log.details?.studentName || 'N/A').replace(/"/g, '""')}"`;
    const transition = `"${(log.transition || log.details?.transition || 'N/A').replace(/"/g, '""')}"`;
    const reason = `"${(log.reason || log.details?.reason || log.details?.notes || 'N/A').replace(/"/g, '""')}"`;
    const resource = `"${(log.resource || '').replace(/"/g, '""')}"`;
    const method = log.method || '';
    const endpoint = `"${(log.endpoint || '').replace(/"/g, '""')}"`;
    const ip = log.ipAddress || '';
    const status = log.status || '';

    csvContent += `${timestamp},${name},${email},${role},${action},${targetStudent},${transition},${reason},${resource},${method},${endpoint},${ip},${status}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="institutional_audit_logs.csv"');
  res.status(200).send(csvContent);
});

module.exports = {
  getAuditLogs,
  getAuditLogStats,
  exportAuditLogs
};
