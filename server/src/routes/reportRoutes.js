const express = require('express');
const router = express.Router();
const { generateReport, exportReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/generate', protect, generateReport);
router.get('/export', protect, exportReport);

module.exports = router;
