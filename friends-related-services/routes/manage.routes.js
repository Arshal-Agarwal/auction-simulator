const express = require('express');
const router = express.Router();

const { verifyAccessToken } = require('../middlewares/verifyAccessToken');
const { getFriends, removeFriend } = require('../controllers/manage.controllers');
const resolveFriendUUID = require('../middlewares/resolveFriendUUID'); // ✅ Import the middleware

// Get all friends
router.get('/getFriends', verifyAccessToken, getFriends);

// Remove a friend (UUID/email/username supported)
router.delete('/removeFriend', verifyAccessToken, resolveFriendUUID, removeFriend); // ✅ Use middleware

module.exports = router;
