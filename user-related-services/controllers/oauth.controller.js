const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshTokenModel');
const { isUserProfileComplete } = require('../utils/isUserProfileComplete'); // create this function

const googleOAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    await issueTokensAndSetCookies(user, res);

    const isComplete = await isUserProfileComplete(user.uuid); // You implement this check

    const redirectUrl = isComplete
      ? 'http://localhost:3000/pages/home'
      : `http://localhost:3000/pages/auth/complete-pre-signup?email=${user.email}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.status(500).json({ error: 'Google OAuth failed' });
  }
};


/**
 * Generates and sets Access & Refresh tokens in secure cookies.
 */
const issueTokensAndSetCookies = async (user, res) => {
  const userUuid = user.uuid;

  const accessToken = jwt.sign({ userUuid }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userUuid }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });

  // Save refresh token in MongoDB
  await RefreshToken.create({
    userUuid,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revokedAt: null,
    replacedByToken: null,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};


/**
 * Handles GitHub OAuth callback.
 */
const githubOAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    await issueTokensAndSetCookies(user, res);

    const isComplete = await isUserProfileComplete(user.uuid); // same check

    const redirectUrl = isComplete
      ? 'http://localhost:3000/pages/home'
      : `http://localhost:3000/pages/auth/complete-pre-signup?email=${encodeURIComponent(user.email)}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('GitHub OAuth callback error:', err);
    res.status(500).json({ error: 'GitHub OAuth failed' });
  }
};


module.exports = { googleOAuthCallback, githubOAuthCallback };
