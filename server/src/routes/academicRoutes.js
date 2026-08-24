const express = require('express');
const router = express.Router();
const {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear,
  deleteAcademicYear,
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  getDivisions,
  createDivision,
  deleteDivision,
  getAcademicHierarchy,
  promoteStudents,
  enrollStudents,
  allocateSubject
} = require('../controllers/academicController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public/Protected Academic Hierarchy Tree
router.get('/hierarchy', protect, getAcademicHierarchy);

// Academic Years Endpoints
router
  .route('/years')
  .get(protect, getAcademicYears)
  .post(protect, authorize('admin'), createAcademicYear);

router
  .route('/years/:id')
  .put(protect, authorize('admin'), updateAcademicYear)
  .delete(protect, authorize('admin'), deleteAcademicYear);

router.patch('/years/:id/set-current', protect, authorize('admin'), setCurrentAcademicYear);

// Semesters Endpoints
router
  .route('/semesters')
  .get(protect, getSemesters)
  .post(protect, authorize('admin'), createSemester);

router
  .route('/semesters/:id')
  .put(protect, authorize('admin'), updateSemester)
  .delete(protect, authorize('admin'), deleteSemester);

// Divisions Endpoints
router
  .route('/divisions')
  .get(protect, getDivisions)
  .post(protect, authorize('admin'), createDivision);

router
  .route('/divisions/:id')
  .delete(protect, authorize('admin'), deleteDivision);

// Engine Operations: Student Promotion, Enrollment, Subject Allocation
router.post('/promote', protect, authorize('admin'), promoteStudents);
router.post('/enroll', protect, authorize('admin'), enrollStudents);
router.post('/allocations', protect, authorize('admin'), allocateSubject);

module.exports = router;
