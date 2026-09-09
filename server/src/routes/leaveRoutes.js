const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  uploadLeaveDocument,
  teacherReviewLeave,
  adminVerifyLeave,
  rescanDocument,
  servePrivateDocument,
  generateDocumentAccessToken,
  serveDocumentByToken,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleSecureDocumentUpload } = require('../middleware/secureUploadMiddleware');

// 1. Public endpoint validated by cryptographically signed temporary token
router.get('/document-stream/:token', serveDocumentByToken);

// All subsequent endpoints require authentication
router.use(protect);

// 2. Upload leave supporting document (PDF, JPG, PNG, max 5MB, virus/malware scanned)
router.post(
  '/upload-document',
  authorize('student', 'admin'),
  handleSecureDocumentUpload('document'),
  uploadLeaveDocument
);

// 3. Main Leave endpoints
router.route('/')
  .post(authorize('student', 'admin'), applyLeave)
  .get(authorize('teacher', 'admin'), getAllLeaves);

router.get('/my', authorize('student', 'admin'), getMyLeaves);

// 4. Multi-Stage Verification Endpoints
router.put('/:id/teacher-review', authorize('teacher', 'admin'), teacherReviewLeave);
router.put('/:id/admin-verify', authorize('admin'), adminVerifyLeave);
router.post('/:id/rescan', authorize('admin'), rescanDocument);

// 5. Private Secure Document Access Endpoints
router.get('/:id/document', authorize('student', 'teacher', 'admin', 'parent'), servePrivateDocument);
router.get('/:id/document-token', authorize('student', 'teacher', 'admin', 'parent'), generateDocumentAccessToken);

// 6. Legacy compatibility route
router.route('/:id')
  .put(authorize('teacher', 'admin'), updateLeaveStatus);

module.exports = router;
