"use client";
import { useState, useEffect, useRef } from "react";
import { Clip } from "@/types/Clip";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import MuxVideoPlayer from "./muxVideoPlayer";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useUser } from "@/config/userProvider";
import toast from "react-hot-toast";

interface VideoModalProps {
  clip: Clip;
  onClose: () => void;
  clipSaved?: boolean;
}

interface UserInfo {
  uid: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
}

export default function VideoModal({
  clip,
  onClose,
  clipSaved,
}: VideoModalProps) {
  const [uploader, setUploader] = useState<UserInfo | null>(null);
  const [saved, setSaved] = useState(clipSaved);
  const modalRef = useRef<HTMLDivElement>(null);
  const { gameSpheres } = useGameSpheresContext();

  const { user } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/profile?uid=${clip.uploadedBy}`);
        const data = await res.json();
        setUploader(data.userData);
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    if (clip.uploadedBy) fetchUser();
  }, [clip.uploadedBy]);

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

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden"; // Prevent background scrolling

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const checkSavedStatus = async () => {
      try {
        const res = await fetch(
          `/api/clips/savedClips?userId=${user?.uid}&clipId=${clip.id}`
        );

        if (res.ok) {
          const data = await res.json();
          setSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };
    checkSavedStatus();
  }, [user?.uid, clip.id]);

  const handleSaveClipClick = async (action: string) => {
    try {
      if (!clip || !user) {
        console.error("Clip and User fields are required");
        return;
      }

      const res = await fetch(`/api/clips/savedClips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          clipId: clip.id,
          action: action,
        }),
      });

      setSaved(action === "save");

      if (!res.ok) {
        throw new Error("Error saving clip");
      }
    } catch (error) {
      console.error("Error saving clip:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* TODO: attach pane to right side of modal for comments */}
      <div
        ref={modalRef}
        className="bg-[#111] rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Video Player */}
        <div className="aspect-video bg-black min-h-[400px]">
          {clip.processingStatus === "ready" && clip.muxPlaybackId ? (
            <MuxVideoPlayer
              playbackId={clip.muxPlaybackId}
              className="w-full h-full"
              poster={clip.thumbnailUrl}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
              {/* This is pretty redundant because I already filter out non-ready videos, but I've added it in as a failsafe */}
              {clip.processingStatus === "preparing" &&
                "Video is still processing..."}
              {clip.processingStatus === "errored" && "Error processing video"}
              {clip.processingStatus === "uploading" && "Upload in progress..."}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-6">
          {/* Caption and GameSphere Info */}
          {/* TODO: ADD "SAVE CLIP TO FAVORITES" OPTION IN THIS DIV, IN-LINE WITH CAPTION, RIGHT-ALIGNED */}
          <div className="mb-4">
            <div className="grid grid-cols-2">
              <h1 className="text-2xl font-bold text-white mb-2">
                {clip.caption}
              </h1>
              {saved && (
                <BookmarkCheck
                  className="ml-auto cursor-pointer"
                  onClick={() => handleSaveClipClick("unsave")}
                ></BookmarkCheck>
              )}
              {!saved && (
                <Bookmark
                  className="ml-auto cursor-pointer"
                  onClick={() => handleSaveClipClick("save")}
                ></Bookmark>
              )}
            </div>
            <div className="flex items-center text-gray-400">
              <span className="text-[#00ffd5] font-medium">
                {getGameSphereName(clip.gameSphereId)}
              </span>
              <span className="mx-2">•</span>
              <span>{formatTimeSinceUpload(clip.uploadedAt)}</span>
            </div>
          </div>

          {/* User Info */}
          {/* TODO: make username clickable -> takes you to their profile ?? */}
          <div className="flex items-center mb-4 pb-4 border-b border-gray-700">
            {uploader?.photoURL && (
              <img
                src={uploader?.photoURL}
                alt={uploader?.displayName || uploader?.username || "User"}
                className="w-10 h-10 rounded-full object-cover mr-2"
              />
            )}
            <div>
              <p className="font-semibold text-white">
                {uploader?.displayName}
              </p>
              <p className="text-sm text-gray-400">
                Uploaded At: {clip.uploadedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
