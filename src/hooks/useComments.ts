import { useState, useEffect } from "react";
import type { Comment } from "@/types/Comment";
import type { Profile } from "@/types/Profile";
import { addComment, deleteComment, listenToComments } from "@/services/clipsService";

export function useComments(clipId: string, user: Profile | null, uploaderId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const unsubscribe = listenToComments(clipId, (data) => {
      setComments(
        data.map((c: any) => ({
          id: c.id,
          userId: c.userId,
          text: c.text,
          createdAt: c.createdAt?.toDate?.() || new Date(),
          displayName: c.displayName,
          photoURL: c.photoURL || null,
        }))
      );
    });
    return () => unsubscribe();
  }, [clipId]);

  const add = async (text: string) => {
    if (!user) return;
    await addComment(clipId, user, text);
  };

  const remove = async (commentId: string, commentUserId: string) => {
    if (!user) return;
    if (user.uid === commentUserId || user.uid === uploaderId) {
      await deleteComment(clipId, commentId);
    }
  };

  return { comments, add, remove };
}
