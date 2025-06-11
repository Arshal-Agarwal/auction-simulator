const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshTokenModel');

async function verifyAccessToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  console.log(`🔐 Incoming request: ${req.method} ${req.originalUrl}`);
  console.log(`🪪 Authorization header: ${authHeader}`);
  console.log(`🧾 Extracted access token: ${accessToken}`);

  if (!accessToken) {
    console.warn('❌ No access token provided');
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log('✅ Access token verified:', decoded);

    req.user = decoded; // { userUuid, iat, exp }
    return next();
  } catch (err) {
    console.warn('⚠️ Access token verification failed:', err.message);

    if (err.name !== 'TokenExpiredError') {
      console.error('❌ Invalid access token:', err);
      return res.status(403).json({ error: 'Invalid access token' });
    }

    console.log('⏳ Access token expired, trying refresh token...');

    const refreshToken = req.cookies?.refreshToken;
    console.log(`🍪 Refresh token from cookies: ${refreshToken}`);

    if (!refreshToken) {
      console.warn('❌ Refresh token missing');
      return res.status(401).json({ error: 'Refresh token missing in cookies' });
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      console.log('✅ Refresh token verified:', decodedRefresh);

      const storedToken = await RefreshToken.findOne({
        token: refreshToken,
        userUuid: decodedRefresh.userUuid,
        revokedAt: null,
        expiresAt: { $gt: new Date() }
      });

      if (!storedToken) {
        console.warn('❌ Refresh token not found or expired in DB');
        return res.status(403).json({ error: 'Invalid or expired refresh token (not in DB)' });
      }

      const newAccessToken = jwt.sign(
        { userUuid: decodedRefresh.userUuid },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      req.user = { userUuid: decodedRefresh.userUuid };

      res.setHeader('Authorization', `Bearer ${newAccessToken}`);
      console.log(`🔄 New access token generated for user: ${decodedRefresh.userUuid}`);

      return next();
    } catch (refreshErr) {
      console.error('❌ Refresh token verification failed:', refreshErr.message);
      return res.status(403).json({ error: 'Invalid or expired refresh token (JWT verify failed)' });
    }
  }
}

module.exports = { verifyAccessToken };
