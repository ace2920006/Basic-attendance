const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getMostAbsentStudents,
  getBestAttendance,
  getDepartmentRankings,
  getTeacherPerformance,
  getDailyAttendance,
  getStudentPersonalAnalytics,
  getTeacherAnalytics,
  getAdminIntelligence
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Student Personal Analytics Dashboard (Phase 27)
router.get('/student/me', getStudentPersonalAnalytics);
router.get('/student/:studentId', getStudentPersonalAnalytics);

// Teacher Analytics Dashboard (Phase 28)
router.get('/teacher/me', authorize('teacher', 'admin'), getTeacherAnalytics);
router.get('/teacher/:teacherId', authorize('teacher', 'admin'), getTeacherAnalytics);

// Phase 29: Admin Intelligence Dashboard (College-Level Control Center)
router.get('/admin-intelligence', authorize('admin'), getAdminIntelligence);
router.get('/intelligence', authorize('admin'), getAdminIntelligence);

// Admin Analytics Consoles
router.get('/dashboard', authorize('admin'), getDashboardAnalytics);
router.get('/most-absent', authorize('admin'), getMostAbsentStudents);
router.get('/best-attendance', authorize('admin'), getBestAttendance);
router.get('/department-ranking', authorize('admin'), getDepartmentRankings);
router.get('/teacher-performance', authorize('admin'), getTeacherPerformance);
router.get('/daily-attendance', authorize('admin'), getDailyAttendance);

module.exports = router;

