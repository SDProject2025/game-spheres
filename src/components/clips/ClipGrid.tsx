"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Clip } from "@/types/Clip";
import ClipCard from "./clipCard";
import VideoModal from "./videoModal";
import { DocumentReference } from "firebase-admin/firestore";
import { SortOption } from "./sortDropdown";
import GameSphereFilter from "./gameSphereFilter";

interface ClipGridProps {
  gameSphereFilter?: string;
  userFilter?: string;
  savedClips?: boolean;
  profileFilter?: string;
  sortBy?: SortOption;
}

export default function ClipGrid({
  gameSphereFilter,
  userFilter,
  savedClips,
  profileFilter,
  sortBy = "popular24h",
}: ClipGridProps) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  useEffect(() => {
    loadClips();
  }, [gameSphereFilter, userFilter, savedClips, profileFilter, sortBy]);

  const loadClips = async () => {
    try {
      setLoading(true);

      // Check to see if we're accessing a user's saved clips
      if (savedClips && profileFilter) {
        await loadSavedClips(profileFilter);
        return;
      }

      // If on a specific GameSphere page
      if (gameSphereFilter && !userFilter) {
        await loadGSClips(gameSphereFilter);
        return;
      }

      // If on the home page
      if (userFilter) {
        await loadHomeClips(userFilter);
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

      const sortedClips = sortClips(readyClips, sortBy);
      setClips(sortedClips);
    } catch (error) {
      console.error("Error loading saved clips:", error);
      setClips([]);
    }
  };

  const loadGSClips = async (gameSphereFilter: string) => {
    try {
      const q = query(
        collection(db, "clips"),
        where("gameSphereId", "==", gameSphereFilter)
      );

      const querySnapshot = await getDocs(q);

      const allClips: Clip[] = [];

      querySnapshot.forEach((doc) => {
        const clipData = doc.data();
        allClips.push({
          id: doc.id,
          ...clipData,
          uploadedAt: clipData.uploadedAt.toDate(),
        } as Clip);
      });

      const readyClips = allClips.filter(
        (clip) => clip.processingStatus === "ready"
      );

      const sortedClips = sortClips(readyClips, sortBy);
      setClips(sortedClips);
    } catch (error) {
      console.error("Error loading GameSphere clips:", error);
      setClips([]);
    }
  };

  const loadHomeClips = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("User not found");
        setClips([]);
        return;
      }

      const userData = userDoc.data();

      const gsSubs: DocumentReference[] = userData.gsSubs || [];
      const userFollowing: string[] = userData.following || [];

      // resolve id from GameSphere ref
      const userSubs: string[] = gsSubs.map((doc) => doc.id);

      if (userSubs.length === 0 && userFollowing.length === 0) {
        setClips([]);
        return;
      }

      // Use a set to track Clip IDs so we dont fetch duplicates
      const seenClipIds = new Set<string>();

      const allClips: Clip[] = [];

      // fetch by GS subs
      const gsClipsPromise = userSubs.length
        ? fetchClipsByGameSphereIds(userSubs, gameSphereFilter, seenClipIds)
        : Promise.resolve([]);

      const followingClipsPromise = userFollowing.length
        ? fetchClipsByFollowing(userFollowing, gameSphereFilter, seenClipIds)
        : Promise.resolve([]);

      // Fetch concurrently
      const [gsClips, followingClips] = await Promise.all([
        gsClipsPromise,
        followingClipsPromise,
      ]);

      allClips.push(...gsClips, ...followingClips);

      const readyClips = allClips.filter(
        (clip) =>
          clip.processingStatus === "ready" && clip.uploadedBy !== userId
      );

      const sortedClips = sortClips(readyClips, sortBy);
      setClips(sortedClips);
    } catch (error) {
      console.error("Error loading home page clips");
      setClips([]);
    }
  };

  const sortClips = (clips: Clip[], sortOption: string) => {
    const clipsToSort = [...clips];

    switch (sortOption) {
      case "popular24h":
        return clipsToSort.sort(
          (a, b) => (b.likesLast24h || 0) - (a.likesLast24h || 0)
        );
      case "popularWeek":
        return clipsToSort.sort(
          (a, b) => (b.likesLastWeek || 0) - (a.likesLastWeek || 0)
        );
      case "popularMonth":
        return clipsToSort.sort(
          (a, b) => (b.likesLastMonth || 0) - (a.likesLastMonth || 0)
        );
      default:
        return clipsToSort.sort(
          (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
        );
    }
  };

  const fetchClipsByGameSphereIds = async (
    gsIds: string[],
    gameSphereFilter: string | undefined,
    seenClipIds: Set<string>
  ) => {
    const allClips: Clip[] = [];
    for (let i = 0; i < gsIds.length; i += 10) {
      const batchIds = gsIds.slice(i, i + 10);
      const conditions = [where("gameSphereId", "in", batchIds)];

      if (gameSphereFilter) {
        conditions.push(where("gameSphereId", "==", gameSphereFilter));
      }

      const q = query(collection(db, "clips"), ...conditions);
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const clipData = doc.data();
        if (!seenClipIds.has(doc.id)) {
          allClips.push({
            id: doc.id,
            ...clipData,
            uploadedAt: clipData.uploadedAt.toDate(),
          } as Clip);
          seenClipIds.add(doc.id); // Mark this clip as seen
        }
      });
    }
    return allClips;
  };

  const fetchClipsByFollowing = async (
    followingIds: string[],
    gameSphereFilter: string | undefined,
    seenClipIds: Set<string>
  ) => {
    const allClips: Clip[] = [];
    for (let i = 0; i < followingIds.length; i += 10) {
      const batchIds = followingIds.slice(i, i + 10);
      const conditions = [where("uploadedBy", "in", batchIds)];

      if (gameSphereFilter) {
        conditions.push(where("gameSphereId", "==", gameSphereFilter));
      }

      const q = query(collection(db, "clips"), ...conditions);
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const clipData = doc.data();
        if (!seenClipIds.has(doc.id)) {
          allClips.push({
            id: doc.id,
            ...clipData,
            uploadedAt: clipData.uploadedAt.toDate(),
          } as Clip);
          seenClipIds.add(doc.id);
        }
      });
    }
    return allClips;
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
