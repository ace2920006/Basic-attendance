const express = require('express');
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  getAttendanceRecords,
  getStudentStats,
  getDashboardAnalytics
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .post(authorize('teacher', 'admin'), markAttendance)
  .get(getAttendanceRecords);

router.post('/bulk', authorize('teacher', 'admin'), markBulkAttendance);
router.get('/stats/:studentId', getStudentStats);
router.get('/analytics', authorize('admin', 'teacher'), getDashboardAnalytics);

module.exports = router;
