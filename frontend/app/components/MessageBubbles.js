import { useEffect, useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import moment from "moment";

export default function MessageBubble({ message, isOwn }) {
  const { text, read, timestamp, senderUuid } = message;
  const time = timestamp ? moment(timestamp).format("h:mm A") : "";
  const [senderName, setSenderName] = useState("");

  useEffect(() => {
    const fetchSender = async () => {
      try {
        const res = await fetch("http://localhost:4000/users/crud/resolveUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ uuid: senderUuid }),
        });

        const data = await res.json();
        if (data?.user?.username) {
          setSenderName(data.user.username);
        }
      } catch (err) {
        console.error("Failed to resolve user", err);
      }
    };

    fetchSender();
  }, [senderUuid]);

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-2`}>
      <div
        className={`relative px-4 py-2 rounded-2xl text-sm max-w-[80%] md:max-w-[60%] shadow-md transition-all duration-200
        ${isOwn
          ? "bg-indigo-600 text-white rounded-br-none dark:bg-indigo-500"
          : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none"}`}
      >
        {!isOwn && senderName && (
          <div className="text-xs font-semibold mb-1 text-indigo-600 dark:text-indigo-400">
            {senderName}
          </div>
        )}

        <p className="whitespace-pre-wrap break-words">{text}</p>

        <div className="mt-1 flex justify-end items-center gap-1 text-xs">
          <span className={`${isOwn ? "text-indigo-100 dark:text-indigo-200" : "text-gray-500 dark:text-gray-400"}`}>
            {time}
          </span>
          {isOwn &&
            (read ? (
              <CheckCheck size={14} className="text-green-300 dark:text-green-400" />
            ) : (
              <Check size={14} className="text-indigo-200 dark:text-indigo-300" />
            ))}
        </div>
      </div>
    </div>
  );
}
