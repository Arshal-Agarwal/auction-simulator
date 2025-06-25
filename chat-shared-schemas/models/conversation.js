const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  participants: [{ type: String, required: true }],
  isGroup: { type: Boolean, default: false },
  admin: { type: String, default: null },
  groupName: { type: String, default: null },
  groupPicture: { type: String, default: null },
  description : { type: String, default: null },

  // ✅ Embed message preview details
  lastMessage: {
    text: { type: String, default: "" },
    read: { type: Boolean, default: true }, // true if already read
    senderUuid: { type: String, default: null },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

conversationSchema.index({ participants: 1 });

conversationSchema.pre('save', function (next) {
  if (this.isGroup && (!this.admin || !this.groupName)) {
    return next(new Error("Group chats must have an admin and groupName."));
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = conversationSchema;
