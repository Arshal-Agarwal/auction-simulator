"use client";

export default function FriendCard({ friend }) {
  const defaultProfile = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <li className="p-2 bg-gray-50 rounded-lg hover:bg-indigo-100 cursor-pointer flex items-center gap-3">
      <img
        src={friend.profile_picture || defaultProfile}
        alt="friend"
        className="w-8 h-8 rounded-full object-cover"
      />
      <span className="text-gray-800 font-medium">{friend.username}</span>
      
    </li>
  );
}
