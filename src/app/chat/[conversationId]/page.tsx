"use client";
import ChatPage from "@/components/chat/chatPage";
import { useUser } from "@/config/userProvider";
import { MessageInput } from "@/types/Message";
import { useParams } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
export default function Chat() {
  const { user } = useUser();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [messages, setMessages] = useState<MessageInput[]>([]);

  async function getMessages() {
    try {
      const res = await fetch(
        `/api/chat/getMessages?conversationId=${conversationId}`
      );
      const data = await res.json();

      const newMessages = data.messageData.filter(
        (msg: MessageInput) =>
          !messages.some((m) => m.messageId === msg.messageId)
      );

      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed";
      console.error(message);
    }
  }

  useEffect(() => {
    getMessages();

    const interval = setInterval(() => {
      getMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

  async function sendMessage(message: string) {
    if (!user) return;
    try {
      const msg: MessageInput = {
        content: message,
        conversationId,
        createdAt: Timestamp.now().toDate().toISOString(),
        senderId: user.uid,
      };
      const res = await fetch(`/api/chat/create/message`, {
        method: "POST",
        body: JSON.stringify(msg),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setMessages([
          ...messages,
          { ...msg, messageId: msg.messageId || crypto.randomUUID() },
        ]);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed";
      console.error(message);
    }
  }

  return (
    <ChatPage
      messages={messages}
      currentUserId={user?.uid}
      onSendMessage={sendMessage}
    />
  );
}
