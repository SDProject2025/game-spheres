import type { MessageInput } from "@/types/Message";

type Props = {
  msg: MessageInput;
  isSent: boolean;
};

export default function MessageBubble({ msg, isSent }: Props) {
  return (
    <div
      key={msg.messageId}
      className={`flex flex-col max-w-[70%] ${isSent ? "ml-auto items-end" : "mr-auto items-start"}`}
    >
      <div
        style={{ overflowWrap: "anywhere" }} // strongest fallback for very long tokens
        className={`px-3 py-2 whitespace-pre-wrap break-words break-all ${
          isSent ? "bg-green-700 text-white" : "bg-gray-600 text-white"
        } rounded-2xl`}
      >
        {msg.content}
      </div>
      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {(() => {
          const createdDate = new Date(msg.createdAt);
          const now = new Date();
          const isToday =
            createdDate.getDate() === now.getDate() &&
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear();

            const isYesterday =
            createdDate.getDate() === now.getDate() - 1 &&
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear();

          if (isToday) {
            return `Today, ${createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`; 
          } else if (isYesterday) {
            return `Yesterday, ${createdDate.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}`
          } else {
            return createdDate.toLocaleString("en", {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        })()}
      </span>
    </div>
  );
}
