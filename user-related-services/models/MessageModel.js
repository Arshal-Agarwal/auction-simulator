const mongoose = require('mongoose');
const messageSchema = require('chat-shared-schemas').Message; // adjust path if needed

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
