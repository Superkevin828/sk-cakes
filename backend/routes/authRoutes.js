const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Private auth endpoints (JWT Protected)
router.get('/profile', protect, authController.getProfile);
router.post('/register', protect, authController.registerAdmin); // Only existing admins can seed/create other admins

module.exports = router;
