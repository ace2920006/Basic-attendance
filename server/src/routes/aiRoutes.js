const express = require('express');
const router = express.Router();
const {
  predictAttendance,
  chatWithAi,
  detectSuspiciousAttendance
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

// Attendance Prediction route
router.get('/predict', predictAttendance);

// AI Chatbot route
router.post('/chat', chatWithAi);

// Suspicious Attendance & Proxy Detection route (Faculty / Admins)
router.get('/suspicious-detection', authorize('teacher', 'admin'), detectSuspiciousAttendance);

module.exports = router;
