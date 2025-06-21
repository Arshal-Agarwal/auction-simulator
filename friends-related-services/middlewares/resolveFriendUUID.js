const { mysqlPool } = require("../db/connectDB");

const resolveFriendUUID = async (req, res, next) => {
  const { friend_uuid, friend_email, friend_username } = req.body;
  // console.log("friend uuid given" + friend_uuid);
  
  if (friend_uuid) {
    // UUID already provided
    return next();
  }

  if (!friend_email && !friend_username) {
    console.log("sdsds");
    return res.status(400).json({ error: "Provide friend_uuid, friend_email, or friend_username." });
  }

  try {
    let query = "";
    let value = "";

    if (friend_email) {
      query = "SELECT uuid FROM users WHERE email = ?";
      value = friend_email;
    } else {
      query = "SELECT uuid FROM users WHERE username = ?";
      value = friend_username;
    }

    const [rows] = await mysqlPool.query(query, [value]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Friend user not found." });
    }

    req.body.friend_uuid = rows[0].uuid;
    req.body.receiver_uuid = rows[0].uuid;
    req.body.requester_uuid = rows[0].uuid;
    
    next();
  } catch (err) {
    console.error("❌ Error in resolveFriendUUID middleware:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = resolveFriendUUID;
