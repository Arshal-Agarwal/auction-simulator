"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import toast from "react-hot-toast";
import {
  MessageCircle,
  UserPlus,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";

import Sidebar from "@/app/components/layout/Sidebar";
import ReportUserModal from "@/app/components/modals/ReportUserModal";

export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    (async () => {
      const [userRes, currentRes, friendsRes] = await Promise.all([
        fetch("http://localhost:4000/users/crud/resolveUserByUsername", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
          credentials: "include",
        }),
        fetch("http://localhost:4000/users/crud/fetchUserDetails", {
          credentials: "include",
        }),
        fetch("http://localhost:4000/friends/manage/getFriends", {
          credentials: "include",
        }),
      ]);

      if (!userRes.ok) {
        toast.error("User not found");
        return router.push("/");
      }

      const userData = await userRes.json();
      const currentData = await currentRes.json();
      const friendsData = await friendsRes.json();

      setUser(userData.user);
      setCurrentUser(currentData.user);
      setFriends(friendsData.friends || []);
      setIsFriend(friendsData.friends?.some((f) => f.uuid === userData.user.uuid));
      setLoading(false);
    })();
  }, [username]);

  const handleSendRequest = async () => {
    const res = await fetch("http://localhost:4000/friends/requests/sendRequest", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_username: user.username }),
    });

    res.ok ? toast.success("Friend request sent") : toast.error("Request cannot be sent");
  };

  const handleUnfriend = async () => {
    const res = await fetch("http://localhost:4000/friends/manage/removeFriend", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_username: user.username }),
    });

    if (res.ok) {
      toast.success("Unfriended");
      setIsFriend(false);
    } else toast.error("Could not unfriend");
  };

  const handleStartChat = async () => {
    try {
      const res = await fetch("http://localhost:4000/messages/conversation/createConversation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantUuids: [user.uuid],
          participantUsernames: [user.username],
          isGroup: false,
          groupName: null,
          groupPicture: null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.conversation._id) {
        router.push(`/pages/chat/${data.conversation._id}`);
      } else {
        toast.error(data.error || "Could not start chat");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Something went wrong");
    }
  };

  const handleReportUser = async (reason) => {
    try {
      const res = await fetch("http://localhost:4000/users/report", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterUuid: currentUser.uuid,
          reportedUuid: user.uuid,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("🚨 Report submitted");
        setShowReportModal(false);
      } else {
        toast.error(data.error || "Failed to report user");
      }
    } catch (err) {
      console.error("Report error:", err);
      toast.error("Something went wrong");
    }
  };

  if (loading) return <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>;
  if (!user || !currentUser) return null;
  if (user.uuid === currentUser.uuid) {
    router.push("/pages/settings");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#111827]">
      <Sidebar friends={friends} />

      <main className="flex-1 ml-[280px] px-6 md:px-12 py-10 bg-white dark:bg-[#111827] overflow-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </button>

        <div className="max-w-3xl mx-auto flex flex-col items-center space-y-8">

          {/* Profile Section */}
          <div className="w-full bg-gray-50 dark:bg-[#1f2937] p-8 rounded-xl shadow-lg flex flex-col items-center space-y-4">
            <img
              src={user.profile_picture || "/circle-user.png"}
              alt="avatar"
              className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover shadow-md"
            />
            <div className="bg-indigo-100 dark:bg-indigo-800 text-indigo-900 dark:text-white px-6 py-3 rounded-lg shadow text-center">
              <h1 className="text-3xl font-semibold">{user.username}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Joined {moment(user.created_at).format("MMMM YYYY")}
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-6 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-2 text-indigo-700 dark:text-indigo-300">About</h2>
            <p className="whitespace-pre-line">
              {user.bio || "This user hasn’t added a bio yet."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full bg-white dark:bg-[#1f2937] p-6 rounded-xl shadow-lg flex flex-wrap justify-center gap-4 border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleStartChat}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <MessageCircle size={18} />
              Start Chat
            </button>

            {isFriend ? (
              <button
                onClick={handleUnfriend}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <UserX size={18} />
                Unfriend
              </button>
            ) : (
              <button
                onClick={handleSendRequest}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <UserPlus size={18} />
                Send Friend Request
              </button>
            )}

            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              <AlertTriangle size={18} />
              Report
            </button>
          </div>
        </div>
      </main>




      {showReportModal && (
        <ReportUserModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportUser}
        />
      )}
    </div>
  );
}
