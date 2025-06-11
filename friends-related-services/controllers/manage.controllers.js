const { mysqlPool } = require("../db/connectDB");

const removeFriend = async (req, res) => {
  const userUuid = req.user?.userUuid;
  const { friend_uuid } = req.body;

  if (!friend_uuid) {
    return res.status(400).json({ error: "friend_uuid is required." });
  }

  try {
    const [result] = await mysqlPool.query(
      `
      DELETE FROM friends 
      WHERE 
        (user_uuid = ? AND friend_uuid = ?)
        OR 
        (user_uuid = ? AND friend_uuid = ?)
      `,
      [userUuid, friend_uuid, friend_uuid, userUuid]
    );

    return res.status(200).json({ message: "Friend removed successfully." });
  } catch (err) {
    console.error("❌ Error removing friend:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};


const getFriends = async (req, res) => {
  const userUuid = req.user?.userUuid;

  try {
    const [rows] = await mysqlPool.query(
      `
      SELECT 
        CASE 
          WHEN user_uuid = ? THEN friend_uuid
          ELSE user_uuid
        END AS friend_uuid,
        created_at
      FROM friends
      WHERE user_uuid = ? OR friend_uuid = ?
      `,
      [userUuid, userUuid, userUuid]
    );

    // ✅ Filter unique friend_uuids
    const uniqueFriendsMap = new Map();
    for (const row of rows) {
      if (!uniqueFriendsMap.has(row.friend_uuid)) {
        uniqueFriendsMap.set(row.friend_uuid, row.created_at);
      }
    }

    const uniqueFriends = Array.from(uniqueFriendsMap.entries()).map(([friend_uuid, created_at]) => ({
      friend_uuid,
      created_at
    }));

    return res.status(200).json({ friends: uniqueFriends });
  } catch (err) {
    console.error("❌ Error fetching friends:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};


module.exports = { getFriends , removeFriend};
