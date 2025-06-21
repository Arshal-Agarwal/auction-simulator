"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function CreateConversationModal({ friends, onClose, onCreated }) {
  const [selectedUuids, setSelectedUuids] = useState([]);
  const [groupName, setGroupName] = useState("");

  const allSelected = friends.length > 0 && selectedUuids.length === friends.length;
  const isGroup = selectedUuids.length > 1;

  const toggleSelectFriend = (uuid) => {
    setSelectedUuids((prev) =>
      prev.includes(uuid) ? prev.filter((u) => u !== uuid) : [...prev, uuid]
    );
  };

  const handleCreateConversation = async () => {
    if (selectedUuids.length === 0) return toast.warn("Select at least one friend.");
    try {
      const res = await fetch("http://localhost:4000/messages/conversation/createConversation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantUuids: selectedUuids,
          participantUsernames: friends
            .filter((f) => selectedUuids.includes(f.uuid))
            .map((f) => f.username),
          isGroup,
          groupName: isGroup ? groupName : null,
          groupPicture: null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Conversation created.");
        onCreated();
        onClose();
      } else {
        toast.error(data.error || "Failed to create conversation.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error("Error creating conversation.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center px-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-3xl shadow-2xl relative space-y-5 border border-indigo-100 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 tracking-wide">
          Start a New Chat
        </h3>

        {/* Select All */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) =>
              e.target.checked
                ? setSelectedUuids(friends.map((f) => f.uuid))
                : setSelectedUuids([])
            }
            className="accent-indigo-500 w-4 h-4"
          />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select All Friends
          </label>
        </div>

        {/* Friend Selection */}
        <div className="space-y-2 max-h-40 overflow-y-auto text-sm pr-1 custom-scrollbar">
          {friends.map((friend) => (
            <label
              key={friend.uuid}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
            >
              <input
                type="checkbox"
                checked={selectedUuids.includes(friend.uuid)}
                onChange={() => toggleSelectFriend(friend.uuid)}
                className="accent-indigo-500 w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-200">{friend.username}</span>
            </label>
          ))}
        </div>

        {/* Group Name Input */}
        {isGroup && (
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border border-indigo-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 outline-none transition"
          />
        )}

        {/* Create Button */}
        <button
          onClick={handleCreateConversation}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold w-full py-2 rounded-2xl transition-all shadow-md hover:shadow-lg"
        >
          Create Conversation
        </button>
      </div>
    </div>
  );
}
