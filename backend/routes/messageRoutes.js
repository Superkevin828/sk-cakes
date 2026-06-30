const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public contact submission
router.post('/', messageController.submitMessage);

// Admin read list
router.get('/', protect, adminOnly, messageController.getAllMessages);
router.patch('/:id/read', protect, adminOnly, messageController.markAsRead);

module.exports = router;
