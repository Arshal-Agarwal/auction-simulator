const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/verifyAccessToken');
const { resolveParticipantUUIDs } = require('../middlewares/resolveParticipantUUIDs');
const { fetchUserConversations,kickMember,makeAdmin, createConversation,deleteConversation,updateConversation,fetchGroupById,leaveGroup } = require('../controllers/conversations.controllers');

router.get('/fetchAllConversations', verifyAccessToken, fetchUserConversations);
// 👇 Create conversation with usernames resolved to UUIDs
router.post('/createConversation', verifyAccessToken, resolveParticipantUUIDs, createConversation);
router.delete('/deleteConversation', verifyAccessToken, deleteConversation);
router.put('/updateConversation', verifyAccessToken, updateConversation);
router.get('/fetchGroupById/:id', verifyAccessToken, fetchGroupById);
router.post('/leaveGroup', verifyAccessToken, leaveGroup);
router.post('/kickMember', verifyAccessToken, kickMember);
router.post('/makeAdmin', verifyAccessToken, makeAdmin);


module.exports = router;

