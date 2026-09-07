const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDefaulters,
  getDefaulterSummary,
  getDefaulterConfiguration,
  updateDefaulterConfiguration,
  evaluateDefaultersBatch,
  escalateDefaulter,
  resolveDefaulter,
  bulkNotifyDefaulters,
  getStudentDefaulterStatus
} = require('../controllers/defaulterController');

// Configuration routes
router
  .route('/config')
  .get(protect, getDefaulterConfiguration)
  .put(protect, authorize('admin'), updateDefaulterConfiguration);

// Summary metrics
router.get('/summary', protect, authorize('admin', 'teacher'), getDefaulterSummary);

// Batch evaluation runner
router.post('/evaluate', protect, authorize('admin', 'teacher'), evaluateDefaultersBatch);

// Bulk notifications
router.post('/notify-bulk', protect, authorize('admin'), bulkNotifyDefaulters);

// Student personal status
router.get('/student/:studentId', protect, getStudentDefaulterStatus);

// Defaulters list & CRUD
router.get('/', protect, authorize('admin', 'teacher'), getDefaulters);
router.post('/:id/escalate', protect, authorize('admin', 'teacher'), escalateDefaulter);
router.post('/:id/resolve', protect, authorize('admin'), resolveDefaulter);

module.exports = router;
