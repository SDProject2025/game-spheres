"use client";
import { useState, useRef, useEffect } from "react";
import type { MessageInput } from "@/types/Message";

interface ChatProps {
  messages?: MessageInput[];
  onSendMessage?: (message: string) => void;
  currentUserId?: string;
}

export default function ChatPage({
  messages = [],
  onSendMessage,
  currentUserId = "current-user",
}: ChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !onSendMessage) return;

    onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="h-screen text-white p-6 flex flex-col items-center">
      <div className="h-full w-full max-w-5xl rounded-2xl overflow-hidden shadow-lg bg-[#111] transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b font-semibold text-lg bg-gray-100 dark:bg-neutral-800">
          Chat
        </div>

        {/* Messages area (flex-1 makes it take all remaining space) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
          {messages.map((msg) => {
            const isSent = msg.senderId === currentUserId;
            return (
              <div
                key={msg.messageId}
                className={`flex flex-col max-w-[70%] ${
                  isSent ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
                  <div className={`px-3 py-2 ${isSent ? "bg-green-700 text-white" : "bg-gray-600 text-white"} rounded-2xl`}>
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
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form (stays pinned at the bottom because flex-col + no flex-1) */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-3 border-t bg-gray-50 dark:bg-neutral-800"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-neutral-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-teal-300 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
