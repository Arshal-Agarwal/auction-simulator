"use client";

export default function FriendCard({ friend }) {
  const defaultProfile = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <li className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-700 cursor-pointer flex items-center gap-3 transition">
      <img
        src={friend.profile_picture || defaultProfile}
        alt={`${friend.username}'s avatar`}
        className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
      />
      <span className="text-gray-800 dark:text-gray-200 font-medium truncate">
        {friend.username}
      </span>
    </li>
  );
}
