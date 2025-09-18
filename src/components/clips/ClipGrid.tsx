"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Clip } from "@/types/Clip";
import ClipCard from "./clipCard";
import VideoModal from "./videoModal";
import { MdNoStroller } from "react-icons/md";

interface ClipGridProps {
  gameSphereFilter?: string;
  userFilter?: string;
  savedClips?: boolean;

  // This will be used to keep track of whose profile you're viewing
  // Not necessarily the same as the person who uploaded the clip
  profileFilter?: string;
}

export default function ClipGrid({
  gameSphereFilter,
  userFilter,
  savedClips,
  profileFilter,
}: ClipGridProps) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  useEffect(() => {
    loadClips();
  }, [gameSphereFilter, userFilter, savedClips, profileFilter]);

  const loadClips = async () => {
    try {
      setLoading(true);

      // Check to see if we're accessing a user's saved clips
      if (savedClips && profileFilter) {
        console.log(`Fetching user ${profileFilter}'s saved clips`);
        await loadSavedClips(profileFilter);
        return;
      }

      // Build query conditions
      const conditions = [];

      // We want to see clips uploaded by profile owner
      // In this case, the profileFilter will be the person who uploaded the clip
      if (profileFilter) {
        conditions.push(where("uploadedBy", "==", profileFilter));
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

  const loadSavedClips = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("User doc not found");
        setClips([]);
        return;
      }

      const userData = userDoc.data();
      const savedClipIds: string[] = userData.savedClips || [];

      if (savedClipIds.length === 0) {
        setClips([]);
        return;
      }

      // batch fetches
      const batches = [];
      for (let i = 0; i < savedClipIds.length; i += 10) {
        const batchIds = savedClipIds.slice(i, i + 10);
        batches.push(batchIds);
      }

      const allClips: Clip[] = [];

      for (const batchIds of batches) {
        const conditions = [where("__name__", "in", batchIds)];

        if (gameSphereFilter) {
          conditions.push(where("gameSphereId", "==", gameSphereFilter));
        }

        const q = query(collection(db, "clips"), ...conditions);

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const clipData = doc.data();
          allClips.push({
            id: doc.id,
            ...clipData,
            uploadedAt: clipData.uploadedAt.toDate(),
          } as Clip);
        });
      }

      const readyClips = allClips.filter(
        (clip) => clip.processingStatus === "ready"
      );

      setClips(readyClips);
    } catch (error) {
      console.error("Error loading saved clips:", error);
      setClips([]);
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
          {profileFilter
            ? savedClips
              ? "This user hasn't saved any clips yet"
              : gameSphereFilter
              ? "This user hasn't uploaded any clips to this GameSphere"
              : "This user hasn't uploaded any clips yet"
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
        <VideoModal
          clip={selectedClip}
          onClose={handleCloseModal}
          clipSaved={savedClips}
        />
      )}
    </>
  );
}
