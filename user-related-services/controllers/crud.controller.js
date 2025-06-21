const { v4: uuidv4 } = require('uuid');
const { mysqlPool } = require('../db/connectDB');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getRefreshTokenFromDbAndVerify } = require('./auth.controller');
const RefreshToken = require('../models/RefreshTokenModel');

const addUser = async (req, res) => {
  console.log("Add user request received");
  console.log('Request body:', req.body);

  const { username, email, password, bio, profile_picture } = req.body;

  if (!username || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields: username, email, password' });
  }

  try {
    // Generate UUID for user
    const uuid = uuidv4();
    const auth_token = uuidv4();

    console.log('Generated UUID:', uuid);
    console.log('Generated auth token:', auth_token);

    // Hash password securely
    const password_hash = await bcrypt.hash(password, 10);
    console.log('Password hash generated');

    // Generate refresh token (JWT)
    const refreshToken = jwt.sign(
      { userUuid: uuid },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Refresh token generated');

    // Generate access token (JWT)
    const accessToken = jwt.sign(
      { userUuid: uuid },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    console.log('Access token generated');

    // Insert user into MySQL
    const insertSql = `
      INSERT INTO users (
        uuid, username, email, password_hash, bio, profile_picture
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await mysqlPool.execute(insertSql, [
      uuid,
      username,
      email,
      password_hash,
      bio || null,
      profile_picture || null
    ]);
    console.log('User inserted into MySQL:', result);

    // Store refresh token (JWT string) in MongoDB
    await RefreshToken.create({
      userUuid: uuid,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      revokedAt: null,
      replacedByToken: null
    });
    console.log('Refresh token stored in MongoDB');

    console.log('All response cookies about to be set');
    console.log('Access Token Cookie:', accessToken);
    console.log('Refresh Token Cookie:', refreshToken);


    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    console.log('Refresh token cookie set');

    // Set access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    console.log('Access token cookie set');

    // Respond with success
    res.status(201).json({
      message: '✅ User created successfully',
      uuid,
      auth_token
    });
  } catch (err) {
    console.error('❌ Error adding user:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

const deleteUser = async (req, res) => {
  console.log("Delete user request hit");
  console.log('Request body:', req.body);

  const { username, email, password } = req.body;
  const refreshToken = req.cookies?.refreshToken;

  console.log('Refresh token from cookie:', refreshToken);

  if ((!username && !email) || !password || !refreshToken) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields: username/email, password, or refresh token' });
  }

  try {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET?.trim();
    if (!refreshTokenSecret) {
      console.log('Missing REFRESH_TOKEN_SECRET');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Find user in MySQL
    const sql = `SELECT * FROM users WHERE ${username ? 'username = ?' : 'email = ?'} LIMIT 1`;
    const identifier = username || email;

    const [rows] = await mysqlPool.execute(sql, [identifier]);

    if (rows.length === 0) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    console.log('User found:', user);

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Verify refresh token JWT
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    console.log("Decoded userUuid:", decoded.userUuid);
    console.log("User fetched from DB:", user.uuid);

    if (decoded.userUuid !== user.uuid) {
      console.log('User UUID mismatch in token');
      return res.status(401).json({ error: 'Invalid refresh token (user mismatch)' });
    }

    // Check token in MongoDB (by actual token string)
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userUuid: user.uuid,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!storedToken) {
      console.log('Refresh token not found or expired/revoked');
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Delete user from MySQL
    await mysqlPool.execute(`DELETE FROM users WHERE uuid = ?`, [user.uuid]);
    console.log('User deleted from MySQL');

    // Delete all associated refresh tokens from MongoDB
    await RefreshToken.deleteMany({ userUuid: user.uuid });
    console.log('All user refresh tokens deleted from MongoDB');

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    // Clear the access token cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: '🗑️ User deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or malformed refresh token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const fetchUserDetails = async (req, res) => {
  const userUuid = req.user.userUuid;

  try {
    const [rows] = await mysqlPool.query(
      'SELECT uuid, username, email, bio, profile_picture, created_at, updated_at FROM users WHERE uuid = ?',
      [userUuid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserDetails = async (req, res) => {
  const userUuid = req.user.userUuid;
  const { username, email, bio, profile_picture, password } = req.body;

  try {
    const fields = [];
    const values = [];

    if (username) {
      fields.push('username = ?');
      values.push(username);
    }
    if (email) {
      fields.push('email = ?');
      values.push(email);
    }
    if (bio) {
      fields.push('bio = ?');
      values.push(bio);
    }
    if (profile_picture) {
      fields.push('profile_picture = ?');
      values.push(profile_picture);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?');
      values.push(hashed);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    values.push(userUuid);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE uuid = ?`;

    await mysqlPool.query(query, values);

    return res.status(200).json({ message: '✅ User details updated successfully' });
  } catch (err) {
    console.error('Error updating user details:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const resolveUser = async (req, res) => {
  const { uuid } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: "UUID not provided" });
  }

  try {
    const [rows] = await mysqlPool.query(
      "SELECT uuid, username, profile_picture FROM users WHERE uuid = ?",
      [uuid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error("Resolve user error:", err);
    res.status(500).json({ error: "Failed to resolve UUID" });
  }
};


module.exports = { addUser, deleteUser, fetchUserDetails, updateUserDetails , resolveUser};
