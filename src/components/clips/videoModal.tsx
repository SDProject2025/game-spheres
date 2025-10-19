"use client";
import { useRef, useEffect, useState } from "react";
import { Clip } from "@/types/Clip";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import { useUser } from "@/config/userProvider";
import { useClipLikes } from "@/hooks/useClipLikes";
import { useSaveStatus } from "@/hooks/useSaveStatus";
import { useComments } from "@/hooks/useComments";
import VideoPlayer from "../videoModal/VideoPlayer";
import LikeButton from "../videoModal/LikeButton";
import SaveButton from "../videoModal/SaveButton";
import UploaderInfo from "../videoModal/UploaderInfo";
import CommentsList from "../videoModal/CommentsList";
import CommentInput from "../videoModal/CommentInput";
import { MessageCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Profile } from "@/types/Profile";
import { useRouter } from "next/navigation";
import ShareButton from "../videoModal/ShareButton";
import { authFetch } from "@/config/authorisation";
import { MessageInput } from "@/types/Message";
import ChatList from "../chat/forms/chatList";
import { ConversationInput } from "@/types/Conversation";

interface VideoModalProps {
  clip: Clip;
  onClose: () => void;
  clipSaved?: boolean;
}

export default function VideoModal({
  clip,
  onClose,
  clipSaved,
}: VideoModalProps) {
  const { user } = useUser();
  const { gameSpheres } = useGameSpheresContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  // Hooks for logic
  const { likesCount, isLiked, toggleLike, isLiking } = useClipLikes(
    clip.id,
    user?.uid
  );

  const { saved, toggleSave } = useSaveStatus(clip.id, user, clipSaved);
  const { comments, add, remove } = useComments(clip.id, user, clip.uploadedBy);
  const [uploader, setUploader] = useState<Profile | null>(null);
  const [openType, setOpenType] = useState<"chat" | null>(null);

  const router = useRouter();

  // fetch uploader
  useEffect(() => {
    let mounted = true;
    if (!clip.uploadedBy) return;
    (async () => {
      try {
        const res = await fetch(`/api/profile?uid=${clip.uploadedBy}`);
        const data = await res.json();
        if (mounted) {
          setUploader(data.userData as Profile);
        }
      } catch (err) {
        console.error("Error fetching uploader:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [clip.uploadedBy]);

  // keyboard escape and body overflow handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prevOverflow || "unset";
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const getGameSphereName = (id: string) =>
    gameSpheres.find((gs) => gs.id === id)?.name || "Unknown Game";

  const formatTimeSinceUpload = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  };

  async function shareClip(chat: ConversationInput) {
    if (!user || !chat.conversationId) return;
    const message: MessageInput = {
      type: "clip",
      content: clip.id,
      senderId: user.uid,
      read: false,
      createdAt: new Date().toISOString(),
      conversationId: chat.conversationId,
    };

    try {
      const res = await authFetch("/api/chat/create/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!res.ok) throw new Error("Failed to send message");
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : "Unable to send message");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-[#111] rounded-lg w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl relative"
      >
        {/* Close button - visible on mobile */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black bg-opacity-90 rounded-full p-2 transition-all lg:hidden"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Left side: video + info */}
        <div className="flex-1 flex flex-col min-h-0 lg:overflow-y-visible">
          {/* Video container */}
          <div className="w-full bg-black flex-shrink-0">
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <div className="absolute inset-0">
                <VideoPlayer clip={clip} />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Title + Like/Save */}
            <div className="mb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white break-words">
                  {clip.caption}
                </h1>
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <LikeButton
                    isLiked={isLiked}
                    likesCount={likesCount}
                    onClick={toggleLike}
                    disabled={isLiking}
                  />
                  <SaveButton saved={!!saved} onClick={toggleSave} />
                  <ShareButton onClick={() => setOpenType("chat")} />
                </div>
              </div>
              <div className="flex items-center text-gray-400 mt-1 text-sm lg:text-base flex-wrap gap-2">
                <span
                  className="text-[#00ffd5] font-medium cursor-pointer"
                  onClick={() => {
                    router.push(`/gameSpheres/${clip.gameSphereId}`);
                  }}
                >
                  {getGameSphereName(clip.gameSphereId)}
                </span>
                <span>•</span>
                <span>{formatTimeSinceUpload(clip.uploadedAt)}</span>
              </div>
            </div>

            {/* uploader info */}
            <UploaderInfo uploader={uploader} uploadedAt={clip.uploadedAt} />
          </div>
        </div>

        {/* Right side: comments */}
        <div className="w-full lg:w-80 bg-[#1a1a1a] border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col flex-shrink-0 lg:min-h-0">
          {/* Header */}
          <button
            onClick={() => setCommentsExpanded(!commentsExpanded)}
            className="p-4 border-b border-gray-700 flex items-center justify-between gap-2 flex-shrink-0 lg:cursor-default hover:bg-[#222] lg:hover:bg-transparent transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">
                Comments {comments.length > 0 && `(${comments.length})`}
              </h2>
            </div>
            {commentsExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400 lg:hidden" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400 lg:hidden" />
            )}
          </button>

          {/* Comments content */}
          <div
            className={`flex flex-col transition-all duration-300 lg:flex-1 lg:min-h-0 ${
              commentsExpanded
                ? "max-h-[50vh]"
                : "max-h-0 lg:max-h-none overflow-hidden lg:overflow-visible"
            }`}
          >
            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              <CommentsList
                comments={comments}
                userId={user?.uid}
                uploaderId={clip.uploadedBy}
                onDelete={remove}
              />
            </div>

            {/* Input */}
            <div className="flex-shrink-0">
              <CommentInput
                onAdd={(text) => {
                  add(text);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {openType && uploader && (
        <ChatList
          type={openType}
          isOpen={true}
          onClose={() => setOpenType(null)}
          renderButton={(chat) => (
            <button
              onClick={() => shareClip(chat)}
              className="px-4 py-2 bg-green-700 text-white hover:bg-green-600 transition"
            >
              Send
            </button>
          )}
        />
      )}
    </div>
  );
}
