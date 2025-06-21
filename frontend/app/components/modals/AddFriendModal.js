"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function AddFriendModal({ onClose }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/users/crud/fetchAllUsers", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(() => toast.error("Failed to load users"));
  }, []);

  const handleSendRequest = async (friend_username) => {
    const res = await fetch("http://localhost:4000/friends/requests/sendRequest", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_username }),
    });

    const data = await res.json();
    res.ok
      ? toast.success("✅ Friend request sent!")
      : toast.error(data.error || "Failed to send request");
  };

  const filtered = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Find & Add Friends
        </h2>

        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.length ? (
            filtered.map(user => (
              <div
                key={user.uuid}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profile_picture || "/default-avatar.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-100">{user.username}</span>
                </div>
                <button
                  onClick={() => handleSendRequest(user.username)}
                  className="text-sm bg-teal-500 text-white px-3 py-1 rounded-full hover:bg-teal-600 transition"
                >
                  Send Request
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
