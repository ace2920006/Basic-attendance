const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getMostAbsentStudents,
  getBestAttendance,
  getDepartmentRankings,
  getTeacherPerformance,
  getDailyAttendance,
  getStudentPersonalAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Student Personal Analytics Dashboard (Phase 27)
router.get('/student/me', getStudentPersonalAnalytics);
router.get('/student/:studentId', getStudentPersonalAnalytics);

// Admin Analytics Consoles
router.get('/dashboard', authorize('admin'), getDashboardAnalytics);
router.get('/most-absent', authorize('admin'), getMostAbsentStudents);
router.get('/best-attendance', authorize('admin'), getBestAttendance);
router.get('/department-ranking', authorize('admin'), getDepartmentRankings);
router.get('/teacher-performance', authorize('admin'), getTeacherPerformance);
router.get('/daily-attendance', authorize('admin'), getDailyAttendance);

module.exports = router;

