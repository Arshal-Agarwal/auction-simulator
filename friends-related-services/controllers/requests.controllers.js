const { mysqlPool } = require("../db/connectDB");

const sendRequest = async (req, res) => {
  const requester_uuid = req.user?.userUuid;
  const { receiver_uuid } = req.body;

  if (!receiver_uuid) {
    return res.status(400).json({ error: 'receiver_uuid is required.' });
  }

  if (requester_uuid === receiver_uuid) {
    return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
  }

  try {
    // ❌ DON'T use mysqlPool.promise().query
    const [existing] = await mysqlPool.query(
      `SELECT * FROM friend_requests WHERE requester_uuid = ? AND receiver_uuid = ?`,
      [requester_uuid, receiver_uuid]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Friend request already sent.' });
    }

    await mysqlPool.query(
      `INSERT INTO friend_requests (requester_uuid, receiver_uuid) VALUES (?, ?)`,
      [requester_uuid, receiver_uuid]
    );

    return res.status(201).json({ message: 'Friend request sent successfully.' });
  } catch (err) {
    console.error('❌ Error in sendRequest:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const retractRequest = async (req, res) => {
  const requester_uuid = req.user?.userUuid;
  const { receiver_uuid } = req.body;

  if (!receiver_uuid) {
    return res.status(400).json({ error: 'receiver_uuid is required.' });
  }

  try {
    const [result] = await mysqlPool.query(
      `DELETE FROM friend_requests WHERE requester_uuid = ? AND receiver_uuid = ?`,
      [requester_uuid, receiver_uuid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    return res.status(200).json({ message: 'Friend request retracted successfully.' });
  } catch (err) {
    console.error('❌ Error in retractRequest:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const acceptRequest = async (req, res) => {
  const receiver_uuid = req.user?.userUuid; // The one accepting the request
  const { requester_uuid } = req.body;

  if (!requester_uuid) {
    return res.status(400).json({ error: 'requester_uuid is required.' });
  }

  try {
    // 1. Delete the request
    const [deleteResult] = await mysqlPool.query(
      `DELETE FROM friend_requests WHERE requester_uuid = ? AND receiver_uuid = ?`,
      [requester_uuid, receiver_uuid]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ error: 'No friend request found.' });
    }

    // 2. Insert both directional friendships
    await mysqlPool.query(
      `INSERT INTO friends (user_uuid, friend_uuid) VALUES (?, ?), (?, ?)`,
      [requester_uuid, receiver_uuid, receiver_uuid, requester_uuid]
    );

    return res.status(200).json({ message: 'Friend request accepted.' });
  } catch (err) {
    console.error('❌ Error accepting request:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const rejectRequest = async (req, res) => {
  const receiver_uuid = req.user?.userUuid;
  const { requester_uuid } = req.body;

  if (!requester_uuid) {
    return res.status(400).json({ error: 'requester_uuid is required.' });
  }

  try {
    const [deleteResult] = await mysqlPool.query(
      `DELETE FROM friend_requests WHERE requester_uuid = ? AND receiver_uuid = ?`,
      [requester_uuid, receiver_uuid]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ error: 'No friend request found.' });
    }

    return res.status(200).json({ message: 'Friend request rejected.' });
  } catch (err) {
    console.error('❌ Error rejecting request:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const fetchSentRequests = async (req, res) => {
  const requester_uuid = req.user?.userUuid;

  try {
    const [rows] = await mysqlPool.query(
      `SELECT receiver_uuid, created_at FROM friend_requests WHERE requester_uuid = ?`,
      [requester_uuid]
    );

    return res.status(200).json({ sentRequests: rows });
  } catch (err) {
    console.error("❌ Error fetching sent requests:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const fetchReceivedRequests = async (req, res) => {
  const receiver_uuid = req.user?.userUuid;

  try {
    const [rows] = await mysqlPool.query(
      `SELECT requester_uuid, created_at FROM friend_requests WHERE receiver_uuid = ?`,
      [receiver_uuid]
    );

    return res.status(200).json({ receivedRequests: rows });
  } catch (err) {
    console.error("❌ Error fetching received requests:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {sendRequest,retractRequest,acceptRequest,rejectRequest,fetchReceivedRequests,fetchSentRequests}