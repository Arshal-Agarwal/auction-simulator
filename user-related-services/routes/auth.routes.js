const express = require('express');
const router = express.Router();
const passport = require('passport');
const { login, logout, checkEmailExists,checkUsernameExists} = require('../controllers/auth.controller');
const { googleOAuthCallback, githubOAuthCallback } = require('../controllers/oauth.controller');
const { verifyAccessToken } = require("../middlewares/verifyAccessToken");

// 🟢 Email existence check route
router.get('/check-email', checkEmailExists);
router.get('/check-username', checkUsernameExists);

router.get("/keep-alive", verifyAccessToken, (req, res) => {
  return res.status(200).json({ message: "Access token refreshed" });
});

// 🔐 Local login/logout
router.post('/login', login);
router.post('/logout', logout);

// 🌐 Google OAuth
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);
router.get('/google/callback', passport.authenticate('google', { session: false }), googleOAuthCallback);

// 🐱 GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), githubOAuthCallback);

module.exports = router;
