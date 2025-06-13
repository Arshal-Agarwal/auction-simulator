const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectMongoDB } = require('./db/connectDB');
const conversation_routes = require('./routes/conversations.routes');
const message_routes = require('./routes/messages.routes')
const Message = require('./models/MessageModel');
const mongoose = require('mongoose');

const app = express();
const port = 5003;

const server = http.createServer(app);

// Connect to MongoDB
connectMongoDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());

// Routes
app.use("/conversation", conversation_routes);
app.use("/msgs", message_routes);

app.get('/', (req, res) => {
  res.send(`Server for message-related services running on http://localhost:${port}`);
});

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`🔗 ${socket.id} joined room ${conversationId}`);
  });

  // Handle sending a message
  socket.on('send_message', async ({ conversationId, senderUuid, text }) => {
    try {
      const newMessage = new Message({
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderUuid,
        text,
        sent: true, // explicitly setting
        read: false,
        readAt: null
      });

      const savedMessage = await newMessage.save();

      // Emit to everyone in the room
      io.to(conversationId).emit('receive_message', savedMessage);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });

  // ✅ Mark message as read
  socket.on('mark_as_read', async ({ messageId, readerUuid }) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        messageId,
        {
          read: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (updated) {
        // Broadcast update to conversation room
        io.to(updated.conversationId.toString()).emit('message_read', {
          messageId: updated._id,
          readerUuid,
          readAt: updated.readAt
        });
      }
    } catch (err) {
      console.error('❌ Error updating message as read:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// ✅ Start server
server.listen(port, () => {
  console.log(`✅ Message-related services running on http://localhost:${port}`);
});
