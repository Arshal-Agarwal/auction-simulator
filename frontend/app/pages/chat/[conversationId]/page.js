"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import MessageBubble from "../../../components/MessageBubbles";

let socket;

export default function ConversationPage() {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userUuid, setUserUuid] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // ✅ Connect to Socket.IO
  useEffect(() => {
    socket = io("http://localhost:5003", { withCredentials: true });
    return () => socket.disconnect();
  }, []);

  // ✅ Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("http://localhost:4000/users/crud/fetchUserDetails", {
          credentials: "include",
        });
        const userData = await userRes.json();
        setUserUuid(userData.user.uuid);

        const convoRes = await fetch("http://localhost:4000/messages/conversation/fetchAllConversations", {
          credentials: "include",
        });
        const convoData = await convoRes.json();
        const thisConvo = convoData.conversations.find((c) => c._id === conversationId);
        setConversation(thisConvo);

        const msgRes = await fetch("http://localhost:4000/messages/msgs/fetchMessagesByConversationId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ conversationId }),
        });
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);

        // Join room
        socket.emit("join_conversation", conversationId);
      } catch (err) {
        console.error("❌ Failed to load chat data:", err);
      }
    };

    if (conversationId) fetchData();
  }, [conversationId]);

  // ✅ Handle real-time incoming messages
  useEffect(() => {
    socket.on("receive_message", (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("message_read", ({ messageId, readerUuid, readAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, read: true, readAt, readerUuid } : msg
        )
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_read");
    };
  }, [conversationId]);

  // ✅ Mark messages as read
  useEffect(() => {
    if (!messages.length || !userUuid) return;

    const unread = messages.filter(
      (m) => !m.read && m.senderUuid !== userUuid
    );

    unread.forEach((msg) => {
      socket.emit("mark_as_read", {
        messageId: msg._id,
        readerUuid: userUuid,
      });
    });
  }, [messages, userUuid]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    socket.emit("send_message", {
      conversationId,
      senderUuid: userUuid,
      text: newMessage.trim(),
    });

    setNewMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const getTitle = () => {
    if (!conversation) return "Loading...";
    if (conversation.isGroup) return conversation.groupName || "Unnamed Group";
    const other = conversation.participants.find((p) => p.uuid !== userUuid);
    return other?.username || "Unknown User";
  };

  const getImage = () => {
    if (!conversation) return "";
    if (conversation.isGroup) return conversation.groupPicture;
    const other = conversation.participants.find((p) => p.uuid !== userUuid);
    return other?.profile_picture;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-300 bg-indigo-50">
        <img
          src={getImage() || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover mr-4"
        />
        <h2 className="text-xl font-bold text-indigo-800">{getTitle()}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.senderUuid === userUuid}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
