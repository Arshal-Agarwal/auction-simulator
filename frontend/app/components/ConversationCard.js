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

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-indigo-200 cursor-pointer transition flex items-center gap-4"
      onClick={() => router.push(`/chat/${convo._id}`)}
    >
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
        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
          {convo.lastMessage || "No messages yet."}
        </p>
      </div>
    </div>
  );
}
