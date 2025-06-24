"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleMore, MailOpen, UserPlus } from "lucide-react";
import io from "socket.io-client";

import Sidebar from "@/app/components/layout/Sidebar";
import ConversationCard from "@/app/components/ConversationCard";
import CreateConversationModal from "@/app/components/modals/CreateConversationModal";
import AddFriendModal from "@/app/components/modals/AddFriendModal";
import FriendRequestsModal from "@/app/components/modals/FriendRequestsModal";
import CustomToastContainer from "@/app/components/ui/ToastContainer";

let socket;

export default function HomePage() {
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [userUuid, setUserUuid] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:4000/users/crud/fetchUserDetails", {
        credentials: "include",
      });

      if (!res.ok) {
        router.push("/pages/auth/sign-in");
        return null;
      }

      const data = await res.json();
      console.log(data);
      
      return data.user;
    } catch (err) {
      console.error("Error fetching user:", err);
      router.push("/pages/auth/sign-in");
      return null;
    }
  };

  const fetchFriends = async () => {
    const res = await fetch("http://localhost:4000/friends/manage/getFriends", {
      credentials: "include",
    });
    setFriends((await res.json()).friends || []);
  };

  const fetchConversations = async () => {
    const res = await fetch("http://localhost:4000/messages/conversation/fetchAllConversations", {
      credentials: "include",
    });
    const data = await res.json();
    setConversations(data.conversations || []);
    data.conversations?.forEach((c) => socket.emit("join_conversation", c._id));
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

  // WebSocket setup
  useEffect(() => {
    socket = io("http://localhost:5003", { withCredentials: true });
    socket.on("receive_message", fetchConversations);
    return () => socket.disconnect();
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      const user = await fetchUser();
      if (!user || !user.uuid) return;

      setUserUuid(user.uuid);
      await fetchFriends();
      await fetchConversations();
    })();
  }, []);

  // 🔄 Silent session refresh every 5 mins (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:4000/users/crud/fetchUserDetails", {
        credentials: "include",
      }).catch(() => {});
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const filtered = conversations.filter((c) => {
    const title = c.isGroup
      ? c.groupName
      : c.participants.find((p) => p.uuid !== userUuid)?.username;
    return title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#111827] transition-colors duration-300">
      <Sidebar
        friends={friends}
        onLogout={handleLogout}
        onShowFriendRequests={() => setShowRequests(true)}
        onAddFriend={() => setShowAddFriend(true)}
      />

      <main className="flex-1 ml-[280px] p-6 md:p-8 overflow-auto">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Your Chats</h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 w-64 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1f2937] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              {searchTerm && (
                <div
                  className="absolute top-2.5 right-3 cursor-pointer text-gray-400 dark:text-gray-500"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddFriend(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-teal-500 text-white font-medium px-4 py-2 rounded-full shadow hover:shadow-md transition"
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">Add Friend</span>
            </button>

            <button
              onClick={() => setShowRequests(true)}
              className="flex items-center gap-2 bg-white dark:bg-[#1f2937] text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-600 font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-teal-50 dark:hover:bg-[#1a2432] transition"
            >
              <MailOpen size={18} />
              <span className="hidden sm:inline">Requests</span>
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length ? (
            filtered.map((c) => (
              <ConversationCard
                key={c._id}
                convo={c}
                userUuid={userUuid}
                className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-2xl shadow hover:shadow-lg transition"
              />
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-lg text-center col-span-full">
              No chats match your search.
            </p>
          )}
        </div>

        <button
          onClick={() => setShowNewChat(true)}
          className="fixed bottom-8 right-12 bg-gradient-to-tr from-green-400 to-teal-500 text-white p-4 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition"
        >
          <MessageCircleMore size={24} />
        </button>
      </main>

      {showNewChat && (
        <CreateConversationModal
          friends={friends}
          onClose={() => setShowNewChat(false)}
          onCreated={fetchConversations}
        />
      )}

      {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} />}
      {showRequests && (
        <FriendRequestsModal onClose={() => setShowRequests(false)} refreshFriends={fetchFriends} />
      )}

      <CustomToastContainer />
    </div>
  );
}
