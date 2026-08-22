const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getAuditLogStats,
  exportAuditLogs
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All audit log routes are restricted to authenticated Admins
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAuditLogs);
router.get('/stats', getAuditLogStats);
router.get('/export', exportAuditLogs);

module.exports = router;
