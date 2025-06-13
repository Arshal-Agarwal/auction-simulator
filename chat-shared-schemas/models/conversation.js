const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Explicit _id
  participants: [{ type: String, required: true }], // UUIDs
  isGroup: { type: Boolean, default: false },
  admin: { type: String, default: null }, // UUID of admin
  groupName: { type: String, default: null },
  groupPicture: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = conversationSchema;