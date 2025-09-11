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
        {/* Cover Image */}
        {getGameSphereCover(clip.gameSphereId) && (
          <img
            src={getGameSphereCover(clip.gameSphereId)!}
            alt="GameSphere Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/70" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="opacity-80 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-4">
            <PlayIcon className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>

        {/* Duration placeholder */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          --:--
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
          <span className="text-blue-500 text-sm font-medium hover:text-blue-400 cursor-pointer">
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
                className="w-6 h-6 rounded-full object-cover mr-2"
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
