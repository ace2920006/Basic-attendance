const express = require('express');
const router = express.Router();
const {
  getClasses,
  createClass,
  deleteClass
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

module.exports = router;
