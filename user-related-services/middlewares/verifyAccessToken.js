const jwt = require('jsonwebtoken');
const RefreshToken = require('chat-shared-schemas').RefreshToken;

async function verifyAccessToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // { userUuid, iat, exp }
    return next();
  } catch (err) {
    if (err.name !== 'TokenExpiredError') {
      return res.status(403).json({ error: 'Invalid access token' });
    }

    // Access token expired — try refresh token
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token missing in cookies' });
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      const storedToken = await RefreshToken.findOne({
        token: refreshToken,
        userUuid: decodedRefresh.userUuid,
        revokedAt: null,
        expiresAt: { $gt: new Date() }
      });

      if (!storedToken) {
        return res.status(403).json({ error: 'Invalid or expired refresh token (not in DB)' });
      }

      // Optional: Track replaced token chains
      const newAccessToken = jwt.sign(
        { userUuid: decodedRefresh.userUuid },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      req.user = { userUuid: decodedRefresh.userUuid };

      // Set new access token in response header
      res.setHeader('Authorization', `Bearer ${newAccessToken}`);
      console.log(`🔄 Access token refreshed for user: ${decodedRefresh.userUuid}`);

      return next();
    } catch (refreshErr) {
      console.error('Refresh token verification failed:', refreshErr);
      return res.status(403).json({ error: 'Invalid or expired refresh token (JWT verify failed)' });
    }
  }
}

module.exports = { verifyAccessToken };
