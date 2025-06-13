const mongoose = require('mongoose');
const refreshTokenSchema = require('chat-shared-schemas').RefreshToken; // adjust path if needed

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
