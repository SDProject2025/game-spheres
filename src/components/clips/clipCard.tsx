"use client";
import { useState, useEffect } from "react";
import { Clip } from "@/types/Clip";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import { PlayIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClipCardProps {
  clip: Clip;
  onPlay?: () => void;
}

interface UserInfo {
  uid: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
}

export default function ClipCard({ clip, onPlay }: ClipCardProps) {
  const [uploader, setUploader] = useState<UserInfo | null>(null);
  const { gameSpheres } = useGameSpheresContext();
  const router = useRouter();

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

  const getThumbnailUrl = (clip: Clip) => {
    if (clip.thumbnailUrl) return clip.thumbnailUrl;
    if (clip.muxPlaybackId) {
      return `https://image.mux.com/${clip.muxPlaybackId}/thumbnail.png?width=640&height=360&fit_mode=preserve`;
    }
    return null;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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
    <div className="bg-[#222] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group w-full max-w-4xl mx-auto">
      {/* Thumbnail */}
      <div
        className="relative bg-gray-800 overflow-hidden aspect-video md:aspect-[16/9] lg:aspect-[16/10] xl:aspect-[16/11] cursor-pointer"
        onClick={onPlay}
      >
        {/* Mux Thumbnail */}
        {getThumbnailUrl(clip) && (
          <img
            src={getThumbnailUrl(clip)!}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Processing Status Overlay */}
        {clip.processingStatus !== "ready" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-white text-center text-sm md:text-base">
              {clip.processingStatus === "uploading" && "Uploading..."}
              {clip.processingStatus === "preparing" && "Processing..."}
              {clip.processingStatus === "errored" && "Error"}
            </div>
          </div>
        )}

        {/* Play button */}
        {clip.processingStatus === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="opacity-80 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-4 md:p-5">
              <PlayIcon
                className="w-7 h-7 md:w-9 md:h-9 text-white"
                fill="white"
              />
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs md:text-sm px-2 py-1 rounded">
          {formatDuration(clip.duration)}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 text-white md:p-4">
        {/* Caption */}
        <h3 className="font-semibold text-gray-100 text-sm md:text-base leading-tight mb-2 line-clamp-2">
          {clip.caption}
        </h3>

        {/* GameSphere name */}
        <div className="flex items-center mb-2">
          <span className="text-[#00ffd5] text-xs md:text-sm font-medium">
            {getGameSphereName(clip.gameSphereId)}
          </span>
        </div>

        {/* User info */}
        {uploader && (
          <div
            className="flex items-center mb-2 cursor-pointer"
            onClick={() => router.replace(`/profile/${uploader.uid}`)}
          >
            {uploader.photoURL && (
              <img
                src={uploader.photoURL}
                alt={uploader.displayName || uploader.username || "User"}
                className="w-4 h-4 md:w-5 md:h-5 rounded-full object-cover mr-2"
              />
            )}
            <span className="text-gray-400 text-sm md:text-base hover:text-gray-200">
              {uploader.username}
            </span>
          </div>
        )}

        {/* Metadata */}
        <div className="text-gray-500 text-xs md:text-sm">
          <span>{formatTimeSinceUpload(clip.uploadedAt)}</span>
        </div>
      </div>
    </div>
  );
}
