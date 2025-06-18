const router = require('express').Router()
const {fetchMessagesByConversationId} = require('../controllers/messages.controllers')
const { verifyAccessToken } = require('../middlewares/verifyAccessToken')


router.post('/fetchMessagesByConversation' , verifyAccessToken ,fetchMessagesByConversationId)
router.get('/another-route' , (req , res)=>{
    // router code here
})

module.exports  = router