const router = require('express').Router();
const {login,logout} = require('../controllers/auth.controller');

router.get('/',(req,res)=>{
    res.send("http://localhost:4000/users/auth api endpoint working correctly");
});

router.post('/login' , login);
router.post('/logout' , logout);

module.exports  = router