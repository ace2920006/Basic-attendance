const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(applyLeave)
  .get(authorize('teacher', 'admin'), getAllLeaves);

router.get('/my', getMyLeaves);

router.route('/:id')
  .put(authorize('teacher', 'admin'), updateLeaveStatus);

module.exports = router;
