const express = require('express');
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  getAttendanceRecords,
  getStudentStats,
  getDashboardAnalytics,
  updateAttendance,
  deleteAttendance,
  scanQRAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .post(authorize('teacher', 'admin'), markAttendance)
  .get(getAttendanceRecords);

router.post('/bulk', authorize('teacher', 'admin'), markBulkAttendance);
router.post('/scan-qr', authorize('student'), scanQRAttendance);
router.get('/stats/:studentId', getStudentStats);
router.get('/analytics', authorize('admin', 'teacher'), getDashboardAnalytics);

router
  .route('/:id')
  .put(authorize('teacher', 'admin'), updateAttendance)
  .delete(authorize('teacher', 'admin'), deleteAttendance);

module.exports = router;

