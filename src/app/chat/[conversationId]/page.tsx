"use client";

import ChatPage from "@/components/chat/forms/chatPage";
import { useUser } from "@/config/userProvider";
import { MessageInput } from "@/types/Message";
import { useParams } from "next/navigation";
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

export default function Chat() {
  const { user } = useUser();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<MessageInput[]>([]);
  const [otherUsername, setOtherUsername] = useState<string>("Chat");

  // 🔹 fetch the conversation + other user's name
  useEffect(() => {
    if (!conversationId || !user?.uid) return;

    async function fetchConversationInfo() {
      const convSnap = await getDoc(doc(db, "conversations", conversationId));
      if (convSnap.exists()) {
        const participants: string[] = convSnap.data().participants || [];
        const otherId = participants.find((id) => id !== user!.uid);

        if (otherId) {
          const userSnap = await getDoc(doc(db, "users", otherId));
          if (userSnap.exists()) {
            setOtherUsername(userSnap.data().username || otherId);
          } else {
            setOtherUsername(otherId);
          }
        }
      }
    }

    fetchConversationInfo();
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId) return;

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
        };
      });

      setMessages(msgs);
    });

    return () => unsub();
  }, [conversationId]);

  async function sendMessage(content: string) {
    if (!user) return;

    const tempId = crypto.randomUUID();
    const msg: MessageInput = {
      messageId: tempId,
      content,
      conversationId,
      createdAt: new Date().toISOString(),
      senderId: user.uid,
    };

    setMessages((prev) => [...prev, msg]);

    try {
      const res = await fetch("/api/chat/create/message", {
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

  return (
    <div className="h-full flex flex-col">
      <ChatPage
        messages={messages}
        currentUserId={user?.uid}
        onSendMessage={sendMessage}
        title={otherUsername}
      />
    </div>
  );
}
