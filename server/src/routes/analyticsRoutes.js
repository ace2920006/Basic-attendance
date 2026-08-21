const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getMostAbsentStudents,
  getBestAttendance,
  getDepartmentRankings,
  getTeacherPerformance,
  getDailyAttendance
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', authorize('admin'), getDashboardAnalytics);
router.get('/most-absent', authorize('admin'), getMostAbsentStudents);
router.get('/best-attendance', authorize('admin'), getBestAttendance);
router.get('/department-ranking', authorize('admin'), getDepartmentRankings);
router.get('/teacher-performance', authorize('admin'), getTeacherPerformance);
router.get('/daily-attendance', authorize('admin'), getDailyAttendance);

module.exports = router;
