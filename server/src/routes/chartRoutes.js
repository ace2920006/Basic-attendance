const express = require('express');
const router = express.Router();
const { getChartAnalytics } = require('../controllers/chartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getChartAnalytics);

module.exports = router;
