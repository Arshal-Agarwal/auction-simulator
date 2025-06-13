const router = require('express').Router();
const {
  sendRequest,
  retractRequest,
  acceptRequest,
  rejectRequest,
  fetchReceivedRequests,
  fetchSentRequests
} = require('../controllers/requests.controllers');
const { verifyAccessToken } = require('../middlewares/verifyAccessToken');
const resolveFriendUUID = require('../middlewares/resolveFriendUUID'); // ✅

router.get('/', (req, res) => {
  res.send("API endpoint for request related services working");
});

// 💡 These routes can now accept friend email/username too
router.post('/sendRequest', verifyAccessToken, resolveFriendUUID, sendRequest);
router.post('/retractRequest', verifyAccessToken, resolveFriendUUID, retractRequest);
router.post('/acceptRequest', verifyAccessToken, resolveFriendUUID, acceptRequest);
router.post('/rejectRequest', verifyAccessToken, resolveFriendUUID, rejectRequest);

router.get('/fetchSentRequests', verifyAccessToken, fetchSentRequests);
router.get('/fetchReceivedRequests', verifyAccessToken, fetchReceivedRequests);

module.exports = router;
