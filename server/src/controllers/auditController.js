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
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Text search
  if (search) {
    query.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { userEmail: { $regex: search, $options: 'i' } },
      { action: { $regex: search, $options: 'i' } },
      { resource: { $regex: search, $options: 'i' } },
      { ipAddress: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter criteria
  if (status) query.status = status;
  if (role) query.userRole = role;
  if (action) query.action = action;
  if (resource) query.resource = resource;

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
      .populate('user', 'name email role rollNumber designation'),
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
    recentFailures
  ] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ createdAt: { $gte: startOfToday } }),
    AuditLog.countDocuments({ status: 'FAILED' }),
    AuditLog.countDocuments({ status: 'WARNING' }),
    AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    AuditLog.find({ status: 'FAILED' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('userName userEmail action endpoint ipAddress createdAt')
  ]);

  res.json({
    success: true,
    data: {
      totalEvents,
      todayEvents,
      failedEvents,
      warningEvents,
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
    .limit(1000);

  let csvContent = 'Timestamp,User Name,User Email,Role,Action,Resource,Method,Endpoint,IP Address,Status\n';

  logs.forEach((log) => {
    const timestamp = new Date(log.createdAt).toISOString();
    const name = `"${(log.userName || '').replace(/"/g, '""')}"`;
    const email = `"${(log.userEmail || '').replace(/"/g, '""')}"`;
    const role = log.userRole || '';
    const action = `"${(log.action || '').replace(/"/g, '""')}"`;
    const resource = `"${(log.resource || '').replace(/"/g, '""')}"`;
    const method = log.method || '';
    const endpoint = `"${(log.endpoint || '').replace(/"/g, '""')}"`;
    const ip = log.ipAddress || '';
    const status = log.status || '';

    csvContent += `${timestamp},${name},${email},${role},${action},${resource},${method},${endpoint},${ip},${status}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="security_audit_logs.csv"');
  res.status(200).send(csvContent);
});

module.exports = {
  getAuditLogs,
  getAuditLogStats,
  exportAuditLogs
};
