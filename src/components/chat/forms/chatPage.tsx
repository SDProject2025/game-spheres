"use client";
import { useRef, useEffect } from "react";
import { MdArrowBack } from "react-icons/md";
import type { MessageInput } from "@/types/Message";
import MessageBubble from "../messageBubble";
import ChatInput from "../chatInput";
import { Profile } from "@/types/Profile";
import Link from "next/link";
import { Clip } from "@/types/Clip";

interface ChatProps {
  messages?: MessageInput[];
  onSendMessage: (message: string) => void;
  currentUserId?: string;
  otherUser: Profile;
  onBack?: () => void; //back btn
  handlePlayVideo: (clip: Clip) => void;
}

export default function ChatPage({
  messages = [],
  onSendMessage,
  currentUserId = "current-user",
  otherUser,
  onBack,
  handlePlayVideo
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SCROLL_DELAY_MS = 500; // adjust to taste

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior });
        return;
      }
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    };

    let delayTimer: number | null = null;
    let raf1 = 0;
    let raf2 = 0;

    // schedule scroll after a short delay so lazy media has time to start loading
    delayTimer = window.setTimeout(() => {
      // let layout settle, then run smooth scroll
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          scrollToBottom("smooth");
        });
      });
    }, SCROLL_DELAY_MS);

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [messages.length]);

  return (
    <div className="h-screen text-white p-6 flex flex-col items-center">
      <div className="h-full w-full max-w-5xl rounded-2xl overflow-hidden shadow-lg bg-[#111] transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)] flex flex-col">
        {/* Header with back button and centered username */}
        <div className="px-4 py-3 border-b font-semibold text-lg bg-gray-100 dark:bg-neutral-800 flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              <MdArrowBack />
            </button>
          )}
          <Link
            href={`/profile/${otherUser.uid}`}
            className="flex-1 text-center"
          >
            {otherUser.username}
          </Link>
        </div>

        {/* Messages area (flex-1 makes it take all remaining space) */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
          {messages.map((msg) => {
            const isSent = msg.senderId === currentUserId;
            return (
              <MessageBubble msg={msg} isSent={isSent} key={msg.messageId} handlePlayVideo={handlePlayVideo}/>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form (stays pinned at the bottom because flex-col + no flex-1) */}
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
