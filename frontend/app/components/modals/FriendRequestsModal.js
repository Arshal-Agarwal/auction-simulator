"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function FriendRequestsModal({ onClose, refreshFriends }) {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const fetchRequests = async () => {
    try {
      const res1 = await fetch("http://localhost:4000/friends/requests/fetchReceivedRequests", { credentials: "include" });
      const { receivedRequests } = await res1.json();

      const res2 = await fetch("http://localhost:4000/friends/requests/fetchSentRequests", { credentials: "include" });
      const { sentRequests } = await res2.json();

      setIncoming(receivedRequests || []);
      setOutgoing(sentRequests || []);
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
      toast.error("Failed to load friend requests.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async ({ uuid, username }) => {
    const res = await fetch("http://localhost:4000/friends/requests/acceptRequest", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_username: username }),
    });
    res.ok ? toast.success("Accepted request") : toast.error("Error accepting");
    await fetchRequests();
    refreshFriends();
  };

  const handleReject = async ({ uuid, username }) => {
    const res = await fetch("http://localhost:4000/friends/requests/rejectRequest", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_username: username }),
    });
    res.ok ? toast.info("Rejected request") : toast.error("Error rejecting");
    await fetchRequests();
  };

  const handleRetract = async ({ uuid, username }) => {
    const res = await fetch("http://localhost:4000/friends/requests/retractRequest", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friend_username: username }),
    });
    res.ok ? toast.info("Retracted Request") : toast.error("Error retracting");
    await fetchRequests();
  };

  const UserCard = ({ uuid, username, profilePicture, actions }) => (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <img
          src={profilePicture || "/default-avatar.png"}
          alt={username}
          className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
        />
        <span className="font-medium text-gray-800 dark:text-gray-100">{username}</span>
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
  );

  return (
  <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] p-6 border border-gray-100 dark:border-gray-700 flex flex-col">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 z-10"
      >
        <X size={20} />
      </button>

      {/* Scrollable content */}
      <div className="overflow-y-auto space-y-6 pr-2 mt-6">
        <h2 className="text-2xl font-bold text-center text-indigo-700 dark:text-indigo-300">
          Friend Requests
        </h2>

        {/* Incoming */}
        <section>
          <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3 border-b pb-1 border-green-200 dark:border-green-700">
            Incoming Requests
          </h3>
          <div className="space-y-3">
            {incoming.length ? (
              incoming.map((req) => (
                <UserCard
                  key={req.requester_uuid}
                  uuid={req.requester_uuid}
                  username={req.username}
                  profilePicture={req.profilePicture}
                  actions={[
                    <button
                      key="accept"
                      onClick={() =>
                        handleAccept({ uuid: req.requester_uuid, username: req.username })
                      }
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      Accept
                    </button>,
                    <button
                      key="reject"
                      onClick={() =>
                        handleReject({ uuid: req.requester_uuid, username: req.username })
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      Reject
                    </button>,
                  ]}
                />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No incoming requests.</p>
            )}
          </div>
        </section>

        {/* Outgoing */}
        <section>
          <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-3 mt-6 border-b pb-1 border-yellow-200 dark:border-yellow-600">
            Outgoing Requests
          </h3>
          <div className="space-y-3">
            {outgoing.length ? (
              outgoing.map((req) => (
                <UserCard
                  key={req.receiver_uuid}
                  uuid={req.receiver_uuid}
                  username={req.username}
                  profilePicture={req.profilePicture}
                  actions={[
                    <button
                      key="retract"
                      onClick={() =>
                        handleRetract({ uuid: req.receiver_uuid, username: req.username })
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      Retract
                    </button>,
                  ]}
                />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No outgoing requests.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  </div>
);
}
