import FollowList from "@/components/profile/forms/followList";
import type { Profile } from "@/types/Profile";
import type { ConversationInput } from "@/types/Conversation";
import type { User } from "@/components/profile/forms/followList";
import ConversationList from "./conversationList";

type Props = {
  userId: string;
  profile: Profile;
  conversations: ConversationInput[];
  usernames: Record<string, string>;
  openType: "followers" | "following" | null;
  setOpenType: (type: "followers" | "following" | null) => void;
  fetchFollowData: () => Promise<User[]>;
  createChat: (otherUser: User) => Promise<void>;
};

export default function ConversationsPageForm({
  userId,
  profile,
  conversations,
  usernames,
  openType,
  setOpenType,
  fetchFollowData,
  createChat,
}: Props) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Active Conversations</h1>
        <button
          onClick={() => setOpenType("following")}
          className="px-4 py-2 bg-green-700 text-white hover:bg-green-600 transition"
        >
          New Chat
        </button>
      </div>

      {conversations.length === 0 && (
        <p className="text-gray-500">No conversations yet.</p>
      )}

      <ConversationList
        conversations={conversations}
        userId={userId}
        usernames={usernames}
      />

      {openType && (
        <FollowList
          type={openType}
          count={openType === "followers" ? 0 : profile.following.length}
          isOpen={true}
          onClose={() => setOpenType(null)}
          onFetchData={fetchFollowData}
          renderButton={(followedUser) => (
            <button
              onClick={() => createChat(followedUser)}
              className="px-4 py-2 bg-green-700 text-white hover:bg-green-600 transition"
            >
              Message
            </button>
          )}
        />
      )}
    </div>
  );
}
