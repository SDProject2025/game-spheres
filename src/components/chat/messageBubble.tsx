import type { MessageInput } from "@/types/Message";

type Props = {
  msg: MessageInput;
  isSent: boolean;
};

export default function MessageBubble({ msg, isSent }: Props) {
  return (
    <div
      key={msg.messageId}
      className={`flex flex-col max-w-[70%] ${
        isSent ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
        <div
          className={`px-3 py-2 ${
            isSent ? "bg-green-700 text-white" : "bg-gray-600 text-white"
          } rounded-2xl`}
        >
          {msg.content}
        </div>
      </div>
      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {new Intl.DateTimeFormat("en", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(msg.createdAt))}
      </span>
    </div>
  );
}
