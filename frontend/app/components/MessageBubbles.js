import { Check, CheckCheck } from "lucide-react";
import moment from "moment";

export default function MessageBubble({ message, isOwn }) {
  const { text, read, timestamp } = message;
  const time = timestamp ? moment(timestamp).format("h:mm A") : "";

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-2`}>
      <div
        className={`relative px-4 py-2 rounded-2xl text-sm max-w-[80%] md:max-w-[60%] shadow-lg transition
        ${isOwn
          ? "bg-indigo-600 text-white rounded-br-none"
          : "bg-gray-100 text-gray-800 rounded-bl-none"}`}
      >
        <p className="whitespace-pre-wrap break-words">{text}</p>

        <div className="mt-1 flex justify-end items-center gap-1 text-xs">
          <span className={`${isOwn ? "text-indigo-100" : "text-gray-500"}`}>
            {time}
          </span>
          {isOwn &&
            (read ? (
              <CheckCheck size={14} className="text-green-300" />
            ) : (
              <Check size={14} className="text-indigo-200" />
            ))}
        </div>
      </div>
    </div>
  );
}
