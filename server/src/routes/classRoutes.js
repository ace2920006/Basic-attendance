const express = require('express');
const router = express.Router();
const {
  getClasses,
  createClass,
  deleteClass,
  startQRAttendance,
  getQRSessionToken,
  stopQRAttendance
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getClasses)
  .post(authorize('teacher', 'admin'), createClass);

router
  .route('/:id')
  .delete(authorize('teacher', 'admin'), deleteClass);

router.post('/:id/start-qr', authorize('teacher', 'admin'), startQRAttendance);
router.get('/:id/qr-token', getQRSessionToken);
router.post('/:id/stop-qr', authorize('teacher', 'admin'), stopQRAttendance);

module.exports = router;
