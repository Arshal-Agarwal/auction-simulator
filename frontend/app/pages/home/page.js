"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserPlus, Users } from "lucide-react";
import ConversationCard from "@/app/components/ConversationCard";
import FriendCard from "@/app/components/FriendCard";

export default function HomePage() {
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [userUuid, setUserUuid] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userRes = await fetch("http://localhost:4000/users/crud/fetchUserDetails", {
          credentials: "include",
        });
        const userData = await userRes.json();

        if (!userRes.ok || !userData.user) {
          console.error("❌ Invalid user data");
          router.push("/pages/auth/sign-in");
          return;
        }

        const uuid = userData.user.uuid;
        setUserUuid(uuid);

        // Fetch conversations
        const convoRes = await fetch("http://localhost:4000/messages/conversation/fetchAllConversations", {
          credentials: "include",
        });
        const convoData = await convoRes.json();
        setConversations(convoData.conversations || []);

        // Fetch friends
        const friendsRes = await fetch("http://localhost:4000/friends/manage/getFriends", {
          credentials: "include",
        });
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);
      } catch (err) {
        console.error("❌ Error in fetching data:", err);
      }
    };

    fetchData();
  }, []);

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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white border-r border-gray-200 p-4 space-y-6 hidden md:block">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-indigo-700">ChatNearby</h1>
          <button onClick={handleLogout}>
            <LogOut className="text-gray-500 hover:text-red-500" />
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Users size={18} /> Friends
          </h2>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {friends.length > 0 ? (
              friends.map((f) => (
                <FriendCard key={f.uuid} friend={f} />
              ))
            ) : (
              <p className="text-sm text-gray-500">No friends added.</p>
            )}
          </ul>
        </div>

        <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
          <UserPlus size={16} className="inline mr-1" /> Add Friend
        </button>
      </aside>

      {/* Chat Section */}
      <main className="flex-1 bg-indigo-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-800">Conversations</h2>
          <input
            type="text"
            placeholder="Search chats..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="grid gap-4">
          {conversations.length > 0 ? (
            conversations.map((c) => (
              <ConversationCard key={c._id} convo={c} userUuid={userUuid} />
            ))
          ) : (
            <p className="text-gray-600 text-sm">You have no active chats.</p>
          )}
        </div>
      </main>
    </div>
  );
}
