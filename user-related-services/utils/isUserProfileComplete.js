const {mysqlPool} = require('../db/connectDB'); // adjust to your DB connection

async function isUserProfileComplete(uuid) {
  const [rows] = await mysqlPool.execute(
    'SELECT username, bio FROM users WHERE uuid = ?',
    [uuid]
  );
  const user = rows[0];
  return user?.username && user?.bio; // or whatever fields you use to check completeness
}

module.exports = { isUserProfileComplete };
