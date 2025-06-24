const router = require('express').Router();
const {verifyAccessToken} = require('../middlewares/verifyAccessToken');

const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // temp storage, you can customize this


const {addUser,deleteUser,fetchUserDetails,updateUserDetails,resolveUser,fetchAllUsers,uploadProfilePicture} = require('./../controllers/crud.controller')

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

router.post(
  "/uploadProfilePicture",
  verifyAccessToken,
  upload.single("image"), // multer middleware
  uploadProfilePicture     // pure handler (req.file is guaranteed)
);

 

module.exports = router;
