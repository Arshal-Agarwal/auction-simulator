const { mysqlPool } = require('../db/connectDB');

const resolveParticipantUUIDs = async (req, res, next) => {
  const { participantUsernames } = req.body;

  if (!Array.isArray(participantUsernames) || participantUsernames.length === 0) {
    return res.status(400).json({ error: 'participantUsernames must be a non-empty array.' });
  }

  try {
    const [rows] = await mysqlPool.query(
      `SELECT username, uuid FROM users WHERE username IN (?)`,
      [participantUsernames]
    );

    const foundUsernames = rows.map(row => row.username);
    const missing = participantUsernames.filter(name => !foundUsernames.includes(name));

    if (missing.length > 0) {
      return res.status(404).json({ error: `Usernames not found: ${missing.join(', ')}` });
    }

    const participantUuids = rows.map(row => row.uuid);
    req.body.participantUuids = participantUuids;

    next();
  } catch (err) {
    console.error('❌ Error resolving participant UUIDs:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { resolveParticipantUUIDs };
