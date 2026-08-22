const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, sensitiveActionLimiter } = require('../middleware/rateLimitMiddleware');
const {
  validateRegister,
  validateLogin,
  validatePasswordChange
} = require('../middleware/validationMiddleware');

router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, validateLogin, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', authLimiter, refreshToken);
router.post('/forgotpassword', sensitiveActionLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', sensitiveActionLimiter, validatePasswordChange, resetPassword);
router.put('/resetpassword', sensitiveActionLimiter, validatePasswordChange, resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

module.exports = router;

