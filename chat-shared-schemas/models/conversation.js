const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }], // Array of user UUIDs
  createdAt: { type: Date, default: Date.now },
});

module.exports = conversationSchema;
