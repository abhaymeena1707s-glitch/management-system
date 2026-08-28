const express = require('express');
const { login, register, sendOtp, loginWithOtp, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { loginSchema, registerSchema } = require('../validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/send-otp', authLimiter, sendOtp);
router.post('/login-otp', authLimiter, loginWithOtp);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
