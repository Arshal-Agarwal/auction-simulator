const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userUuid: {
    type: String,
    required: true,
    ref: 'User'
  },
  token: {
    type: String, // actual JWT token
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date,
    default: null
  },
  replacedByToken: {
    type: String,
    default: null
  }
});

// Auto-delete document once `expiresAt` is hit
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports =  refreshTokenSchema;
