"use client";
import { useState, useEffect } from "react";
import { Clip } from "@/types/Clip";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import { PlayIcon } from "lucide-react";

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
  const { gameSpheres } = useGameSpheresContext();
  const [uploader, setUploader] = useState<UserInfo | null>(null);

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

  const getGameSphereCover = (id: string) =>
    gameSpheres.find((gs) => gs.id === id)?.coverUrl;

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
    <div className="bg-[#222] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-gray-800 overflow-hidden"
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
            <div className="text-white text-center">
              {clip.processingStatus === "uploading" && "Uploading..."}
              {clip.processingStatus === "preparing" && "Processing..."}
              {clip.processingStatus === "errored" && "Error"}
            </div>
          </div>
        )}

        {/* Play button - when processing is done */}
        {clip.processingStatus === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="opacity-80 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-4">
              <PlayIcon className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(clip.duration)}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 text-white">
        {/* Caption */}
        <h3 className="font-semibold text-gray-100 text-sm leading-tight mb-2 line-clamp-2">
          {clip.caption}
        </h3>

        {/* GameSphere name */}
        <div className="flex items-center mb-2">
          <span className="text-[#00ffd5] text-xs font-medium hover:text-blue-400 cursor-pointer">
            {getGameSphereName(clip.gameSphereId)}
          </span>
        </div>

        {/* User info */}
        {uploader && (
          <div className="flex items-center mb-2">
            {uploader.photoURL && (
              <img
                src={uploader.photoURL}
                alt={uploader.displayName || uploader.username || "User"}
                className="w-5 h-5 rounded-full object-cover mr-2"
              />
            )}
            <span className="text-gray-400 text-sm hover:text-gray-200 cursor-pointer">
              {uploader.displayName || uploader.username || uploader.uid}
            </span>
          </div>
        )}

        {/* Metadata */}
        <div className="text-gray-500 text-xs">
          <span>{formatTimeSinceUpload(clip.uploadedAt)}</span>
        </div>
      </div>
    </div>
  );
}
