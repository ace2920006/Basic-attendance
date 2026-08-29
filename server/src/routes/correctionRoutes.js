const express = require('express');
const router = express.Router();
const {
  createCorrectionRequest,
  getCorrectionRequests,
  reviewCorrectionRequest,
  getAttendanceAuditTrail
} = require('../controllers/correctionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .post(createCorrectionRequest)
  .get(getCorrectionRequests);

router.put('/:id/review', authorize('teacher', 'admin'), reviewCorrectionRequest);
router.get('/history/:attendanceId', getAttendanceAuditTrail);

module.exports = router;
