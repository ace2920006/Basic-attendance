const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  startSession,
  getActiveSession,
  getSessionQRToken,
  stopSession,
  checkInSession,
  simulateCheckIn,
  getSessionDetails,
  getAttendanceSessions
} = require('../controllers/sessionController');

router.use(protect);

router.post('/start', authorize('teacher', 'admin'), startSession);
router.get('/active', getActiveSession);
router.get('/', getAttendanceSessions);
router.get('/:id', getSessionDetails);
router.get('/:id/qr-token', getSessionQRToken);
router.post('/:id/stop', authorize('teacher', 'admin'), stopSession);
router.post('/:id/checkin', checkInSession);
router.post('/:id/simulate-checkin', simulateCheckIn);

module.exports = router;
