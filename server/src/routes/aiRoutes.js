const express = require('express');
const router = express.Router();
const {
  predictAttendance,
  chatWithAi,
  detectSuspiciousAttendance,
  calculateForecast,
  getStudentForecast
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

// Attendance Prediction route
router.get('/predict', predictAttendance);

// Phase 26: Attendance Forecasting Engine routes
router.post('/forecast/calculate', calculateForecast);
router.get('/forecast/me', getStudentForecast);

// AI Chatbot route
router.post('/chat', chatWithAi);

// Suspicious Attendance & Proxy Detection route (Faculty / Admins)
router.get('/suspicious-detection', authorize('teacher', 'admin'), detectSuspiciousAttendance);

module.exports = router;

