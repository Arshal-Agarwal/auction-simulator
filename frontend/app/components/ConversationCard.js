"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function ConversationCard({ convo, userUuid }) {
  const router = useRouter();

  const isGroup = convo.isGroup;
  const defaultProfile = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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
      className={`relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-indigo-200 dark:hover:shadow-indigo-500/20 cursor-pointer transition flex items-center gap-4 ${
        isUnread ? "ring-2 ring-indigo-300 dark:ring-indigo-500" : ""
      }`}
      onClick={() => router.push(`/pages/chat/${convo._id}`)}
    >
      {/* 🔵 Unread dot */}
      {isUnread && (
        <>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-400 rounded-full animate-ping z-10" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-600 rounded-full z-20" />
        </>
      )}

      <img
        src={chatData.image}
        alt={`${chatData.title}'s avatar`}
        className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {chatData.title}
          </h3>
          <MessageCircle className="text-indigo-500" size={20} />
        </div>

        <p
          className={`text-sm mt-1 line-clamp-1 transition ${
            isUnread
              ? "font-semibold text-indigo-800 dark:text-indigo-300"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {convo.lastMessage?.text || "No messages yet."}
        </p>

        {/* Uncomment if you want to show timestamps later
        <p className="text-xs text-right text-gray-400 mt-1">
          {convo.lastMessage?.timestamp ? new Date(convo.lastMessage.timestamp).toLocaleTimeString() : ""}
        </p>
        */}
      </div>
    </div>
  );
}
