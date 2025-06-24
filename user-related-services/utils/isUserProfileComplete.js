const { mysqlPool } = require('../db/connectDB');

/**
 * Checks whether a user with the given UUID has an existing email in the database.
 * Used to determine if the user already has an account entry from OAuth or sign-up.
 *
 * @param {string} uuid - UUID from the OAuth provider
 * @returns {Promise<boolean>}
 */
async function isUserProfileComplete(uuid) {
  try {
    const [rows] = await mysqlPool.execute(
      'SELECT email FROM users WHERE uuid = ?',
      [uuid]
    );

    return !!rows[0]?.email; // ✅ True if email exists
  } catch (err) {
    console.error("Error in isUserProfileComplete:", err);
    return false;
  }
}

module.exports = { isUserProfileComplete };
