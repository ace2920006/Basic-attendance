const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getFlaggedAttendanceRecords,
  reviewAttendanceRecord,
  bulkReviewAttendanceRecords,
  getAntiProxyAnalytics,
  getDeviceSharingClusters
} = require('../controllers/antiProxyController');

// All anti-proxy review routes require authentication and teacher/admin authorization
router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/flagged', getFlaggedAttendanceRecords);
router.get('/analytics', getAntiProxyAnalytics);
router.get('/device-clusters', getDeviceSharingClusters);
router.put('/review/:id', reviewAttendanceRecord);
router.post('/bulk-review', bulkReviewAttendanceRecords);

module.exports = router;
