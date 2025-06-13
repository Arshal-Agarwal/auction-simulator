const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../models/RefreshTokenModel');
const { mysqlPool } = require('../db/connectDB');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Fetch user from MySQL
    const [rows] = await mysqlPool.execute(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const userUuid = user.uuid;
    const accessToken = jwt.sign(
      { userUuid },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshTokenValue = jwt.sign(
      {
        userUuid,
        tokenId: uuidv4(),
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token in MongoDB
    await RefreshToken.create({
      userUuid,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
    };

    // Set access token cookie (expires in 15 minutes)
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    // Set refresh token cookie (expires in 7 days)
    res.cookie('refreshToken', refreshTokenValue, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      message: '✅ Login successful',
      userUuid,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const logout = async (req, res) => {
  try {
    const refreshTokenValue = req.cookies.refreshToken;

    if (!refreshTokenValue) {
      return res.status(400).json({ error: 'No refresh token provided' });
    }

    // Delete refresh token from DB
    await RefreshToken.deleteOne({ token: refreshTokenValue });

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
    });

    // Clear the access token cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });


    return res.status(200).json({ message: '✅ Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  logout,
};
