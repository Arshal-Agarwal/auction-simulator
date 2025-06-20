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
        u.uuid AS uuid,
        u.username,
        u.profile_picture,
        f.created_at
      FROM friends f
      JOIN users u ON (
        (f.user_uuid = ? AND u.uuid = f.friend_uuid) OR
        (f.friend_uuid = ? AND u.uuid = f.user_uuid)
      )
      WHERE f.user_uuid = ? OR f.friend_uuid = ?
      `,
      [userUuid, userUuid, userUuid, userUuid]
    );

    // ✅ Deduplicate by uuid (in case multiple entries exist)
    const uniqueFriendsMap = new Map();
    for (const friend of rows) {
      if (!uniqueFriendsMap.has(friend.uuid)) {
        uniqueFriendsMap.set(friend.uuid, friend);
      }
    }

    const uniqueFriends = Array.from(uniqueFriendsMap.values());

    return res.status(200).json({ friends: uniqueFriends });
  } catch (err) {
    console.error("❌ Error fetching friends:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};



module.exports = { getFriends , removeFriend};
