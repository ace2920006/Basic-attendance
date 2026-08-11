const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  assignTeacherToSubject,
  assignStudentsToSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getSubjects)
  .post(protect, authorize('admin'), createSubject);

router
  .route('/:id')
  .get(protect, getSubjectById)
  .put(protect, authorize('admin'), updateSubject)
  .delete(protect, authorize('admin'), deleteSubject);

router.post('/:id/assign-teacher', protect, authorize('admin'), assignTeacherToSubject);
router.post('/:id/assign-students', protect, authorize('admin'), assignStudentsToSubject);

module.exports = router;
