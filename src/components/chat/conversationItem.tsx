import type { ConversationInput } from "@/types/Conversation";

type Props = {
  conv: ConversationInput;
  userId: string;
  usernames: Record<string, string>;
};

export default function ConversationItem({ conv, userId, usernames }: Props) {
  return (
    <>
      <div className="flex justify-between">
        <span>
          Conversation with:{" "}
          {conv.participants
            .filter((uid) => uid !== userId)
            .map((uid) => usernames[uid] || uid)
            .join(", ")}
        </span>
        <span className="text-sm text-gray-400">
          {conv.updatedAt
            ? new Intl.DateTimeFormat([], {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(conv.updatedAt))
            : ""}
        </span>
      </div>
      <p
        className="text-gray-300 text-sm mt-1 truncate"
        style={{ overflowWrap: "anywhere" }}
      >
        {conv.lastMessage || "No messages yet."}
      </p>
    </>
  );
}
