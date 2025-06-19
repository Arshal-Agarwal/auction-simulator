const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../models/RefreshTokenModel');
const { mysqlPool } = require('../db/connectDB');

const checkEmailExists = async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Missing email query parameter' });
  }

  try {
    const [rows] = await mysqlPool.query(
      'SELECT COUNT(*) AS count FROM users WHERE email = ?',
      [email]
    );

    const exists = rows[0].count > 0;

    res.status(200).json({ exists });
  } catch (err) {
    console.error('❌ Error checking email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const checkUsernameExists = async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: 'Missing username query parameter' });
  }

  try {
    const [rows] = await mysqlPool.query(
      'SELECT COUNT(*) AS count FROM users WHERE username = ?',
      [username]
    );

    const exists = rows[0].count > 0;

    res.status(200).json({ exists });
  } catch (err) {
    console.error('❌ Error checking username:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const login = async (req, res) => {
  try {
    const { password, email, username } = req.body;

    if (!password || (!email && !username)) {
      return res.status(400).json({ error: "Email or username and password required" });
    }

    // Query user by email OR username
    const [rows] = await mysqlPool.execute(
      `SELECT * FROM users WHERE ${email ? "email = ?" : "username = ?"} LIMIT 1`,
      [email || username]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const userUuid = user.uuid;
    const accessToken = jwt.sign({ userUuid }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const refreshTokenValue = jwt.sign(
      { userUuid, tokenId: uuidv4() },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await RefreshToken.create({
      userUuid,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshTokenValue, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      message: "✅ Login successful",
      userUuid,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
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
  checkEmailExists,
  checkUsernameExists
};
