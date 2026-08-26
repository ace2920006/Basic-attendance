const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getRules,
  updateRules,
  resetRules,
  evaluateSandbox
} = require('../controllers/rulesController');

router.use(protect);

router.route('/')
  .get(getRules)
  .put(authorize('admin'), updateRules);

router.post('/reset', authorize('admin'), resetRules);
router.post('/evaluate', evaluateSandbox);

module.exports = router;
