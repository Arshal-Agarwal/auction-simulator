const router = require('express').Router()
const { sendRequest , retractRequest ,acceptRequest,rejectRequest ,fetchReceivedRequests,fetchSentRequests} = require('../controllers/requests.controllers');
const { verifyAccessToken } = require('../middlewares/verifyAccessToken');


router.get('/' ,(req , res)=>{
    res.send("API endpoint for request related services working");
})


router.post('/sendRequest' , verifyAccessToken , sendRequest);
router.post('/retractRequest' , verifyAccessToken , retractRequest);
router.post('/acceptRequest' , verifyAccessToken , acceptRequest);
router.post('/rejectRequest' , verifyAccessToken , rejectRequest);

router.get('/fetchSentRequests' , verifyAccessToken , fetchSentRequests);
router.get('/fetchReceivedRequests' , verifyAccessToken , fetchReceivedRequests);

module.exports  = router

