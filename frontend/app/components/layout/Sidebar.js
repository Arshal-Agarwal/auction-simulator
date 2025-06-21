"use client";

import { LogOut, UserPlus, Users, MailOpen } from "lucide-react";
import FriendCard from "../FriendCard";

export default function Sidebar({ friends, onLogout, onShowFriendRequests, onAddFriend }) {
  return (
    <aside className="w-[280px] min-h-screen bg-gradient-to-b from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 py-8 hidden md:flex flex-col justify-between shadow-2xl dark:shadow-xl">

      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#6b5b95] to-[#feb47b] bg-clip-text text-transparent tracking-wide">
            ChatNearby
          </h1>
          <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            title="Logout"
          >
            <LogOut className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" size={20} />
          </button>
        </div>

        {/* Friends List */}
        <div>
          <h2 className="text-md font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Users size={20} /> Friends
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {friends.length > 0 ? (
              friends.map((f) => (
                <div
                  key={f.uuid}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition rounded-xl p-3"
                >
                  <FriendCard friend={f} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No friends added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        
      </div>
    </aside>
  );
}
