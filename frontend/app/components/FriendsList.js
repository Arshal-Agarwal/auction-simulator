"use client";

import FriendCard from "./FriendCard";
import { MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FriendList({ friends }) {
  const router = useRouter();
  const [loadingUsername, setLoadingUsername] = useState(null);

  const handleChatClick = async (username) => {
    try {
      setLoadingUsername(username);

      const res = await fetch("http://localhost:4000/messages/conversation/createConversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          participantUsernames: [username],
          isGroup: false,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.conversation?._id) {
        throw new Error(data.error || "Failed to create/fetch conversation");
      }

      router.push(`/pages/chat/${data.conversation._id}`);
    } catch (error) {
      console.error("Chat navigation error:", error);
      alert("Unable to start or fetch chat.");
    } finally {
      setLoadingUsername(null);
    }
  };

  if (!friends || friends.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        No friends added yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((f) => (
        <div
          key={f.uuid}
          className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gradient-to-r from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-md hover:shadow-lg transition duration-200 ease-in-out"
        >
          <div className="flex-1 overflow-hidden">
            <FriendCard friend={f} />
          </div>

          <button
            onClick={() => handleChatClick(f.username)}
            className={`flex items-center justify-center ml-4 p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 ${
              loadingUsername === f.username ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={`Chat with ${f.username}`}
            disabled={loadingUsername === f.username}
          >
            {loadingUsername === f.username ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <MessageCircle size={18} />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
