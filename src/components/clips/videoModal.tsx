"use client";
import { useRef, useEffect, useState } from "react";
import { Clip } from "@/types/Clip";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import { useUser } from "@/config/userProvider";
import { useClipLikes } from "@/hooks/useClipLikes";
import { useSaveStatus } from "@/hooks/useSaveStatus";
import { useComments } from "@/hooks/useComments";
import { fetchUploader } from "@/services/clipsService";
import VideoPlayer from "../videoModal/VideoPlayer";
import LikeButton from "../videoModal/LikeButton";
import SaveButton from "../videoModal/SaveButton";
import UploaderInfo from "../videoModal/UploaderInfo";
import CommentsList from "../videoModal/CommentsList";
import CommentInput from "../videoModal/CommentInput";
import { MessageCircle } from "lucide-react";
import type { Profile } from "@/types/Profile";
import type { Comment } from "@/types/Comment";

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

  // Hooks for logic
  const { likesCount, isLiked, toggleLike, isLiking } = useClipLikes(
    clip.id,
    user?.uid
  );
  const { saved, toggleSave } = useSaveStatus(clip.id, user, clipSaved);
  const { comments, add, remove } = useComments(clip.id, user, clip.uploadedBy);

  const [uploader, setUploader] = useState<Profile | null>(null);

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
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-[#111] rounded-lg w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl"
      >
        {/* Left side: video + info */}
        <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-y-visible">
          {/* Video container */}
          <div className="w-full bg-black flex-shrink-0 overflow-hidden">
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
                </div>
              </div>
              <div className="flex items-center text-gray-400 mt-1 text-sm lg:text-base flex-wrap gap-2">
                <span className="text-[#00ffd5] font-medium">
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
        <div className="w-full lg:w-80 bg-[#1a1a1a] border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col min-h-[250px] lg:min-h-0 flex-shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center gap-2 flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Comments</h2>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
  );
}
