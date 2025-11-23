const express = require('express');
const router = express.Router();
const messageController = require('../Controllers/messageController');
const protect = require('../middleware/authMiddleware');

// GET /api/messages
router.get('/', messageController.listMessages);

// POST /api/messages (protected)
router.post('/', protect, messageController.createMessage);

module.exports = router;
