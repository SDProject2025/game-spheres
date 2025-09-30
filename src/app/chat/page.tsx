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
import type { ConversationInput } from "@/types/Conversation";
import type { Profile } from "@/types/Profile";
import { User } from "@/components/profile/forms/followList";
import { authFetch } from "@/config/authorisation";
import ConversationsPageForm from "@/components/chat/forms/conversationsPage";

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
    <ConversationsPageForm
      userId={user.uid}
      profile={profile!}
      conversations={conversations}
      usernames={usernames}
      openType={openType}
      setOpenType={setOpenType}
      fetchFollowData={fetchFollowData}
      createChat={createChat}
    />
  );
}
