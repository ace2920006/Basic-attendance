const express = require('express');
const router = express.Router();
const {
  getLinkedWards,
  linkWard,
  getParentOverview,
  getParentAttendance,
  getParentSubjects,
  getParentLeaves,
  getParentWarnings,
  getParentNotifications
} = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All Parent Portal routes require authentication and parent/admin authorization
router.use(protect, authorize('parent', 'admin'));

// Ward Management
router.get('/wards', getLinkedWards);
router.post('/link-ward', linkWard);

// Ward Academic Data
router.get('/overview/:studentId?', getParentOverview);
router.get('/attendance/:studentId?', getParentAttendance);
router.get('/subjects/:studentId?', getParentSubjects);
router.get('/leaves/:studentId?', getParentLeaves);
router.get('/warnings/:studentId?', getParentWarnings);
router.get('/notifications', getParentNotifications);

module.exports = router;
