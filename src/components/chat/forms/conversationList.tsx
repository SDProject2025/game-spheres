import { ConversationInput } from "@/types/Conversation";
import Link from "next/link";
import ConversationItem from "../conversationItem";

type Props = {
  conversations: ConversationInput[];
  userId: string;
  usernames: Record<string, string>;
};

export default function ConversationList({
  conversations,
  userId,
  usernames,
}: Props) {
  return (
    <ul className="space-y-2">
      {conversations.map((conv) => (
        <li key={conv.conversationId}>
          <Link
            href={`/chat/${conv.conversationId}`}
            className={`block p-4 ${
              conv.unreadCounts && conv.unreadCounts[userId] > 0
                ? "bg-green-800 hover:bg-green-700"
                : "bg-gray-800 hover:bg-gray-700"
            } text-white rounded-lg transition`}
          >
            <ConversationItem
              conv={conv}
              userId={userId}
              usernames={usernames}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
