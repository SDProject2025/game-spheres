"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Clip } from "@/types/Clip";
import ClipCard from "./clipCard";
import VideoModal from "./videoModal";

interface ClipGridProps {
  gameSphereFilter?: string;
  userFilter?: string;
}

export default function ClipGrid({
  gameSphereFilter,
  userFilter,
}: ClipGridProps) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  useEffect(() => {
    loadClips();
  }, [gameSphereFilter, userFilter]);

  const loadClips = async () => {
    if (!userFilter) {
      setClips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Build query conditions
      const conditions = [];

      if (userFilter) {
        conditions.push(where("uploadedBy", "==", userFilter));
      }

      if (gameSphereFilter) {
        conditions.push(where("gameSphereId", "==", gameSphereFilter));
      }

      const q = query(
        collection(db, "clips"),
        ...conditions,
        orderBy("uploadedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const clipsData: Clip[] = [];

      querySnapshot.forEach((doc) => {
        const clipData = doc.data();
        clipsData.push({
          id: doc.id,
          ...clipData,
          uploadedAt: clipData.uploadedAt.toDate(),
        } as Clip);
      });

      // Filter out non-ready clips
      const readyClips = clipsData.filter(
        (clip) => clip.processingStatus === "ready"
      );

      setClips(readyClips);
    } catch (error) {
      console.error("Error loading clips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClip = (clip: Clip) => {
    setSelectedClip(clip);
  };

  const handleCloseModal = () => {
    setSelectedClip(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading clips...</p>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No clips found
        </h3>
        <p className="text-gray-500">
          {gameSphereFilter
            ? "No clips found for this GameSphere. Be the first to upload one!"
            : "No clips have been uploaded yet. Upload the first one!"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {clips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            onPlay={() => handlePlayClip(clip)}
          />
        ))}
      </div>

      {/* Video Modal */}
      {selectedClip && (
        <VideoModal clip={selectedClip} onClose={handleCloseModal} />
      )}
    </>
  );
}
