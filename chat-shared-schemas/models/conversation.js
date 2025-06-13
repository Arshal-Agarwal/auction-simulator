const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  participants: [{ type: String, required: true }],
  isGroup: { type: Boolean, default: false },
  admin: { type: String, default: null },
  groupName: { type: String, default: null },
  groupPicture: { type: String, default: null },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index participants array for efficient querying
conversationSchema.index({ participants: 1 });

// Enforce group rules
conversationSchema.pre('save', function (next) {
  if (this.isGroup) {
    if (!this.admin || !this.groupName) {
      return next(new Error("Group chats must have an admin and groupName."));
    }
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = conversationSchema;
