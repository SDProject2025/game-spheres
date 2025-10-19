import React, { useState, useEffect } from "react";
import { ConversationInput } from "@/types/Conversation";
import { db } from "@/config/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useUser } from "@/config/userProvider";
import { Profile } from "@/types/Profile";

interface ChatListProps {
  type: "chat";
  isOpen: boolean;
  onClose: () => void;
  renderButton?: (user: ConversationInput) => React.ReactNode;
}

export default function ChatList({
  type,
  isOpen,
  onClose,
  renderButton,
}: ChatListProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();
  const [conversations, setConversations] = useState<ConversationInput[]>([]);
  const [users, setUsers] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
      orderBy("__name__", "desc")
    );

    const unsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const convs: ConversationInput[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          conversationId: doc.id,
          lastMessage: data.lastMessage?.content || "",
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate().toISOString()
            : "",
          participants: data.participants || [],
          unreadCounts: data.unreadCounts || {}, // <-- include this
        };
      });

      setConversations(convs);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    async function fetchUsernames() {
      const uids = Array.from(
        new Set(conversations.flatMap((c) => c.participants))
      );

      const map: Record<string, Profile> = { ...users }; // preserve already fetched
      await Promise.all(
        uids.map(async (uid) => {
          if (!map[uid]) {
            const snap = await getDoc(doc(db, "users", uid));
            if (snap.exists()) {
              map[uid] = snap.data() as Profile;
            }
          }
        })
      );
      setUsers(map);
    }

    if (conversations.length > 0) fetchUsernames();
  }, [conversations]);

  if (!isOpen) return null;

  const title = "Chats";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md max-h-96 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No chats yet</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {conversations.map((conv) => {
                const otherUser = conv.participants
                  .filter((uid) => uid !== user?.uid)
                  .map((uid) => users[uid] || "Loading...")[0];

                return (
                  <div
                    key={conv.conversationId}
                    className="flex items-center justify-between px-4 py-2 hover:bg-[#222] transition-colors cursor-pointer"
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#333] overflow-hidden flex items-center justify-center">
                        {otherUser.photoURL ? (
                          <img
                            src={otherUser.photoURL}
                            alt={otherUser.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            👤
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-white font-medium">
                          {otherUser.displayName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          @{otherUser.username}
                        </p>
                      </div>
                    </div>

                    {renderButton && (
                      <div className="ml-4 flex-shrink-0">
                        {renderButton(conv)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
