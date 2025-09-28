"use client";

import ChatPage from "@/components/chat/forms/chatPage";
import { useUser } from "@/config/userProvider";
import { MessageInput } from "@/types/Message";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/config/firebaseConfig";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { authFetch } from "@/config/authorisation";
import { Profile } from "@/types/Profile";

export default function Chat() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<MessageInput[]>([]);
  const [otherUser, setOtherUser] = useState<Profile>();

  // 🔹 fetch the conversation + other user's profile
  useEffect(() => {
    if (!conversationId || !user?.uid) return;

    async function fetchConversationInfo() {
      const convSnap = await getDoc(doc(db, "conversations", conversationId));
      if (convSnap.exists()) {
        const participants: string[] = convSnap.data().participants || [];
        const otherId = participants.find((id) => id !== user!.uid);

        if (otherId) {
          try {
            const res = await fetch(`/api/profile?uid=${otherId}`);
            const data = await res.json();
            setOtherUser(data.userData);
          } catch (e) {
            const message =
              e instanceof Error ? e.message : "Couldn't fetch profile";
            console.error(message);
          }
        }
      }
    }

    fetchConversationInfo();
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId || !user) return;

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: MessageInput[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          messageId: doc.id,
          content: data.content ?? "",
          conversationId: data.conversationId ?? conversationId,
          senderId: data.senderId ?? "unknown",
          createdAt:
            data.createdAt?.toDate?.()?.toISOString?.() ||
            (typeof data.createdAt === "string"
              ? data.createdAt
              : new Date().toISOString()),
          read: data.read,
        };
      });

      setMessages(msgs);

      const unread = msgs.filter((m) => m.senderId !== user.uid && !m.read);

      if (unread.length > 0) {
        markRead(unread);
      }
    });

    return () => unsub();
  }, [conversationId, user]);

  async function sendMessage(content: string) {
    if (!user) return;

    const tempId = crypto.randomUUID();
    const msg: MessageInput = {
      messageId: tempId,
      content,
      conversationId,
      createdAt: new Date().toISOString(),
      senderId: user.uid,
      read: false,
    };

    setMessages((prev) => [...prev, msg]);

    try {
      const res = await authFetch("/api/chat/create/message", {
        method: "POST",
        body: JSON.stringify(msg),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }
    } catch (e) {
      console.error(e instanceof Error ? e.message : "Failed");
      setMessages((prev) => prev.filter((m) => m.messageId !== tempId));
    }
  }

  async function markRead(unreadMessages: MessageInput[]) {
    try {
      const res = await authFetch("/api/chat/update/read", {
        method: "POST",
        body: JSON.stringify(unreadMessages),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      console.error("Couldn't mark read:", e instanceof Error ? e.message : "");
    }
  }

  if (!otherUser) return <h1>Loading...</h1>

  return (
    <div className="h-full flex flex-col">
      <ChatPage
        messages={messages}
        currentUserId={user?.uid}
        onSendMessage={sendMessage}
        otherUser={otherUser}
        onBack={() => router.push("/chat")}
      />
    </div>
  );
}
