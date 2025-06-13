const Conversation = require('../models/ConversationModel');
const Message = require('../models/MessageModel');

const fetchMessagesByConversationId = async (req, res) => {
    console.log("request hit to fetch messages");
    
    const userUuid = req.user?.userUuid; // set by auth middleware
    const { conversationId } = req.body;

    if (!userUuid || !conversationId) {
        return res.status(400).json({ error: 'Missing user or conversation ID.' });
    }

    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found.' });
        }

        if (!conversation.participants.includes(userUuid)) {
            return res.status(403).json({ error: 'You are not a participant of this conversation.' });
        }

        const messages = await Message.find({ conversationId })
            .sort({ timestamp: 1 }) // ascending
            .exec();

        return res.status(200).json({ messages });
    } catch (err) {
        console.error('❌ Error fetching messages:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    fetchMessagesByConversationId
};
