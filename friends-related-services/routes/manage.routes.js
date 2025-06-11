const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/verifyAccessToken');
const { getFriends, removeFriend } = require('../controllers/manage.controllers');

router.get('/getFriends', verifyAccessToken, getFriends);
router.delete('/removeFriend', verifyAccessToken, removeFriend);

module.exports = router;
