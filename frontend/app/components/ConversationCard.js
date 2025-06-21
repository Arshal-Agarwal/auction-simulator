"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function ConversationCard({ convo, userUuid }) {
  const router = useRouter();

  const isGroup = convo.isGroup;
  const defaultProfile =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const otherUser = !isGroup
    ? convo.participants.find((p) => p.uuid !== userUuid)
    : null;

  const chatData = {
    title: isGroup
      ? convo.groupName || "Unnamed Group"
      : otherUser?.username || "Unknown",
    image: isGroup
      ? convo.groupPicture || defaultProfile
      : otherUser?.profile_picture || defaultProfile,
  };

  const isUnread =
    convo.lastMessage &&
    convo.lastMessage.senderUuid !== userUuid &&
    !convo.lastMessage.read;

  return (
    <div
      className={`relative bg-white p-4 rounded-lg shadow-md hover:shadow-indigo-200 cursor-pointer transition flex items-center gap-4 ${
        isUnread ? "ring-2 ring-indigo-300" : ""
      }`}
      onClick={() => router.push(`/pages/chat/${convo._id}`)}
    >
      {/* 🔵 Dot indicator for unread */}
      {isUnread && (
  <>
    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-400 rounded-full animate-ping" />
    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-600 rounded-full" />
  </>
)}


      <img
        src={chatData.image}
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {chatData.title || "Loading..."}
          </h3>
          <MessageCircle className="text-indigo-500" size={20} />
        </div>
        <p
          className={`text-sm mt-1 line-clamp-1 transition ${
            isUnread
              ? "font-bold text-indigo-800"
              : "text-gray-500"
          }`}
        >
          {convo.lastMessage?.text || "No messages yet."}
        </p>
      </div>
    </div>
  );
}
