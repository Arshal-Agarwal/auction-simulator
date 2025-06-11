// middleware/auth.js
const jwt = require('jsonwebtoken');
const { getRefreshTokenFromDbAndVerify } = require('../controllers/auth.controller');

async function verifyAccessToken(req, res, next) {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  // No tokens = no access
  if (!accessToken && !refreshToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (accessToken) {
    try {
      const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = payload; // e.g., { userUuid }
      return next();
    } catch (err) {
      // Token expired or invalid → attempt refresh
    }
  }

  // Attempt using refresh token
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const stored = await getRefreshTokenFromDbAndVerify(decoded.tokenId, decoded.userUuid);
    if (!stored) throw new Error('Refresh token not valid');

    // Create new access token
    const newAccessToken = jwt.sign(
      { userUuid: decoded.userUuid },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
    });

    req.user = { userUuid: decoded.userUuid };
    next();

  } catch (err) {
    console.error('Refresh token failed:', err);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

module.exports = verifyAccessToken;
