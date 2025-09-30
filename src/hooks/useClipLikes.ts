import { useState, useEffect } from "react";
import { listenToLikes, toggleLikeClip } from "@/services/clipsService";

export function useClipLikes(clipId: string, userId?: string) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToLikes(clipId, setLikesCount);
    return () => unsubscribe();
  }, [clipId]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/clips/likes?userId=${userId}&clipId=${clipId}`);
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.isLiked);
        }
      } catch (err) {
        console.error("Error checking like status:", err);
      }
    })();
  }, [userId, clipId]);

  const toggleLike = async () => {
    if (!userId || isLiking) return;
    setIsLiking(true);
    try {
      const action = isLiked ? "unlike" : "like";
      await toggleLikeClip(userId, clipId, action);
      setIsLiked(!isLiked);
    } finally {
      setIsLiking(false);
    }
  };

  return { likesCount, isLiked, toggleLike, isLiking };
}
