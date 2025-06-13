const { mysqlPool } = require("../db/connectDB");

const resolveReceiverUUID = async (req, res, next) => {
  try {
    const { receiver_email, receiver_username } = req.body;

    if (!receiver_email && !receiver_username) {
      return res.status(400).json({ error: "Provide receiver_email or receiver_username." });
    }

    let query = "";
    let value = "";

    if (receiver_email) {
      query = "SELECT uuid FROM users WHERE email = ?";
      value = receiver_email;
    } else if (receiver_username) {
      query = "SELECT uuid FROM users WHERE username = ?";
      value = receiver_username;
    }

    const [rows] = await mysqlPool.query(query, [value]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    req.body.receiver_uuid = rows[0].uuid;
    next();
  } catch (err) {
    console.error("❌ Error in resolveReceiverUUID middleware:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = resolveReceiverUUID;
