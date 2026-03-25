// routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/ask', chatController.askAI);

module.exports = router;