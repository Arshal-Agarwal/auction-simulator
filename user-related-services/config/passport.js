const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { mysqlPool } = require('../db/connectDB');

// Helper function to create user
async function createUser({ username, email, profilePicture }) {
  const uuid = uuidv4();
  const password = await bcrypt.hash("placeholder", 10); // Placeholder password
  await mysqlPool.execute(
    "INSERT INTO users (uuid, username, email, password_hash, bio, profile_picture) VALUES (?, ?, ?, ?, ?, ?)",
    [uuid, username, email, password, null, profilePicture]
  );
  return { uuid };
}

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error("No email found from Google account"));

    const username = profile.displayName || email.split('@')[0];
    const profilePicture = profile.photos?.[0]?.value || null;

    const [rows] = await mysqlPool.execute("SELECT * FROM users WHERE email = ?", [email]);
    let user = rows[0];
    if (!user) user = await createUser({ username, email, profilePicture });

    done(null, { uuid: user.uuid });
  } catch (err) {
    done(err);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || "/auth/github/callback",
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error("GitHub account must have a verified public email"));

    const username = profile.username;
    const profilePicture = profile.photos?.[0]?.value || null;

    const [rows] = await mysqlPool.execute("SELECT * FROM users WHERE email = ?", [email]);
    let user = rows[0];
    if (!user) user = await createUser({ username, email, profilePicture });

    done(null, { uuid: user.uuid });
  } catch (err) {
    done(err);
  }
}));
