"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/config/userProvider";
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
import Link from "next/link";
import type { ConversationInput } from "@/types/Conversation";
import type { Profile } from "@/types/Profile";
import { User } from "@/components/profile/forms/followList";
import { authFetch } from "@/config/authorisation";
import FollowList from "@/components/profile/forms/followList";

export default function ConversationsPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<null | Profile>();
  const [openType, setOpenType] = useState<null | "followers" | "following">(
    null
  );
  const [conversations, setConversations] = useState<ConversationInput[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;
    async function fetchUserData() {
      try {
        const res = await fetch(`/api/profile?uid=${uid}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.userData ?? null);
        } else {
          console.error("Error fetching profile");
          setProfile(null);
        }
      } catch (err) {
        console.error(err);
        setProfile(null);
      }
    }

    fetchUserData();
  }, [user]);

  // fetches list of conversations as a snapshot
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc"),
      orderBy("__name__", "desc")
    );

    const unsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const convs: ConversationInput[] = snapshot.docs.map((doc) => ({
        conversationId: doc.id,
        lastMessage: doc.data().lastMessage?.content || "",
        updatedAt: doc.data().updatedAt?.toDate
          ? doc.data().updatedAt.toDate().toISOString()
          : "",
        participants: doc.data().participants || [],
      }));
      setConversations(convs);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    async function fetchUsernames() {
      const uids = Array.from(
        new Set(conversations.flatMap((c) => c.participants))
      );

      const map: Record<string, string> = { ...usernames }; // preserve already fetched
      await Promise.all(
        uids.map(async (uid) => {
          if (!map[uid]) {
            const snap = await getDoc(doc(db, "users", uid));
            if (snap.exists()) {
              map[uid] = snap.data().username || uid;
            } else {
              map[uid] = uid;
            }
          }
        })
      );
      setUsernames(map);
    }

    if (conversations.length > 0) fetchUsernames();
  }, [conversations]);

  async function fetchFollowData() {
    if (!user) return [];
    try {
      const res = await authFetch(`/api/profile/${user.uid}/following`);
      if (!res.ok) throw new Error("Failed to fetch follow data");
      const data = await res.json();
      return data.users; // matches the API response
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function createChat(otherUser: User) {
    if (!user) return;

    try {
      const res = await authFetch("/api/chat/create/conversation", {
        method: "POST",
        body: JSON.stringify({ participants: [user.uid, otherUser.id] }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create chat");

      setOpenType(null);
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return <div>Loading...</div>;
  if (!profile) return <div>Error...</div>;

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
      <ul className="space-y-2">
        {conversations.map((conv) => (
          <li key={conv.conversationId}>
            <Link
              href={`/chat/${conv.conversationId}`}
              className="block p-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <div className="flex justify-between">
                <span>
                  Conversation with:{" "}
                  {conv.participants
                    .filter((uid) => uid !== user.uid)
                    .map((uid) => usernames[uid] || uid)
                    .join(", ")}
                </span>
                <span className="text-sm text-gray-400">
                  {conv.updatedAt
                    ? new Intl.DateTimeFormat("en", {
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
            </Link>
          </li>
        ))}
      </ul>
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
