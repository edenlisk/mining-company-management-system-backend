const express = require('express');
const { addMessage, getMessages, getLastMessage } = require('../controllers/messageControllers');
const router = express.Router();



router.route('/')
    .post(addMessage)

router.route('/:chatId')
    .get(getMessages)

router.route('/last/:chatId')
    .get(getLastMessage)

module.exports = router;