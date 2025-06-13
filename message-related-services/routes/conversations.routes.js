const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/verifyAccessToken');
const { resolveParticipantUUIDs } = require('../middlewares/resolveParticipantUUIDs');
const { fetchUserConversations, createConversation,deleteConversation,updateConversation } = require('../controllers/conversations.controllers');

router.get('/fetchAllConversations', verifyAccessToken, fetchUserConversations);
// 👇 Create conversation with usernames resolved to UUIDs
router.post('/createConversation', verifyAccessToken, resolveParticipantUUIDs, createConversation);
router.delete('/deleteConversation', verifyAccessToken, deleteConversation);
router.put('/updateConversation', verifyAccessToken, updateConversation);

module.exports = router;
