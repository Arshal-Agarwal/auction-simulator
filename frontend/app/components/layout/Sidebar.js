"use client";

import { LogOut, UserPlus, Users, MailOpen, Settings, Moon, Sun } from "lucide-react";
import FriendList from "../FriendsList";
import AddFriendModal from "../modals/AddFriendModal";
import FriendRequestsModal from "../modals/FriendRequestsModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar({ friends }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    fetch("http://localhost:4000/users/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      localStorage.clear();
      router.push("/pages/auth/sign-in");
    });
  };

  return (
    <>
      <aside className="w-[280px] fixed inset-y-0 left-0 flex flex-col bg-gradient-to-b from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 py-6 shadow-2xl dark:shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#6b5b95] to-[#feb47b] bg-clip-text text-transparent tracking-wide">
            ChatNearby
          </h1>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            title="Logout"
          >
            <LogOut className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" size={20} />
          </button>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar mb-6">
          <h2 className="text-md font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Users size={20} /> Friends
          </h2>
          <div className="space-y-3">
            <FriendList friends={friends} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setShowAddFriend(true)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-green-400 to-teal-500 text-white hover:shadow-md transition"
          >
            <UserPlus size={18} />
            Add Friend
          </button>

          <button
            onClick={() => setShowRequests(true)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg border border-teal-200 text-teal-700 bg-white dark:bg-gray-900 hover:bg-teal-50 dark:hover:bg-gray-800 transition"
          >
            <MailOpen size={18} />
            Friend Requests
          </button>

          <button
            onClick={() => router.push("/pages/settings")}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition"
          >
            <Settings size={18} />
            Settings
          </button>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      {/* Modals */}
      {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} />}
      {showRequests && <FriendRequestsModal onClose={() => setShowRequests(false)} />}
    </>
  );
}
