"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Bell,
  Paintbrush,
} from "lucide-react";
import { Pencil, Save } from "lucide-react"; // Add at the top with other imports
import AccountSettings from "@/app/components/settings/AccountSettings";


import Sidebar from "@/app/components/layout/Sidebar";
import ConfirmationModal from "@/app/components/modals/ConfirmationModal";
import AddFriendModal from "@/app/components/modals/AddFriendModal";
import FriendRequestsModal from "@/app/components/modals/FriendRequestsModal";

export default function SettingsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("account");
  const [modalOpen, setModalOpen] = useState(false);

  const [friends, setFriends] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  // Fetch friends
  const fetchFriends = async () => {
    const res = await fetch("http://localhost:4000/friends/manage/getFriends", {
      credentials: "include",
    });
    const data = await res.json();
    setFriends(data.friends || []);
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

  const handleApply = () => setModalOpen(true);
  const handleConfirm = () => {
    setModalOpen(false);
    console.log("✅ Changes applied!");
  };

  const handleDiscard = () => {
    console.log("❌ Changes discarded!");
    router.back();
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const tabs = [
    { key: "account", label: "Account", icon: <User size={16} /> },
    { key: "privacy", label: "Privacy", icon: <ShieldCheck size={16} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { key: "appearance", label: "Appearance", icon: <Paintbrush size={16} /> },
  ];

  return (
    <div className="relative min-h-screen  bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">


      <Sidebar
        friends={friends}
        onLogout={handleLogout}
        onAddFriend={() => setShowAddFriend(true)}
        onShowFriendRequests={() => setShowRequests(true)}
      />

      <main className="flex-grow py-10 px-4 ml-[280px] md:px-12 relative">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 mb-4 hover:underline"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-gray-50 dark:bg-gray-800"
                    : "text-gray-600 dark:text-gray-400 hover:text-indigo-600"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "account" && (
              <AccountSettings></AccountSettings>
            )}
            {activeTab === "privacy" && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Privacy Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Control who can see your activity and personal data.
                </p>
              </>
            )}
            {activeTab === "notifications" && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Notification Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose how you want to receive alerts and updates.
                </p>
              </>
            )}
            {activeTab === "appearance" && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Appearance Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Customize the theme and look of the app.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleDiscard}
            className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Discard Changes
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Apply Changes
          </button>
        </div>
      </main>

      {/* Modals */}
      <ConfirmationModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
      {showAddFriend && (
        <AddFriendModal onClose={() => setShowAddFriend(false)} />
      )}
      {showRequests && (
        <FriendRequestsModal
          onClose={() => setShowRequests(false)}
          refreshFriends={fetchFriends}
        />
      )}
    </div>
  );
}
