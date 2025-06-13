const jwt = require('jsonwebtoken');
const RefreshToken = require('chat-shared-schemas').RefreshToken;

async function verifyAccessToken(req, res, next) {
  const accessToken = req.cookies?.accessToken;
  console.log(accessToken);
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing in cookies' });
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

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userUuid: decodedRefresh.userUuid },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      req.user = { userUuid: decodedRefresh.userUuid };

      // Set new access token as cookie
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      console.log(`🔄 Access token refreshed for user: ${decodedRefresh.userUuid}`);
      return next();
    } catch (refreshErr) {
      console.error('Refresh token verification failed:', refreshErr);
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
  }
}

module.exports = { verifyAccessToken };
