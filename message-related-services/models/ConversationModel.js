const mongoose = require('mongoose');
const conversationSchema = require('chat-shared-schemas').Conversation; // adjust path if needed

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
