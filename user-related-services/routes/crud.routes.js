const router = require('express').Router();
const {verifyAccessToken} = require('../middlewares/verifyAccessToken');

const {addUser,deleteUser,fetchUserDetails,updateUserDetails,resolveUser,fetchAllUsers} = require('./../controllers/crud.controller')

// POST /crud/addUser
router.post('/addUser',addUser);
router.post('/resolveUser',resolveUser);
router.post('/deleteUser',deleteUser);
router.get('/fetchUserDetails',verifyAccessToken,fetchUserDetails);
router.post('/updateUserDetails',verifyAccessToken,updateUserDetails);
router.get('/fetchAllUsers',verifyAccessToken,fetchAllUsers);
router.get("/",(req,res)=>{
    res.send("users/crud endpoint working");
});
 

module.exports = router;
