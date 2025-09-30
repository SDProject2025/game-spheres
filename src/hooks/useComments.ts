import { useState, useEffect } from "react";
import type { Comment } from "@/types/Comment";
import type { Profile } from "@/types/Profile";
import { authFetch } from "@/config/authorisation";
import type { Notification } from "@/types/Notification";
import {
  addComment,
  deleteComment,
  listenToComments,
} from "@/services/clipsService";

interface User {
  uid?: string;
  username?: string;
  displayName?: string | null;
  photoURL?: string | null;
}

export function useComments(
  clipId: string,
  user: User | null,
  uploaderId?: string
) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const unsubscribe = listenToComments(clipId, (data) => {
      setComments(
        data.map((c: Comment) => ({
          id: c.id,
          userId: c.userId,
          text: c.text,
          createdAt: c.createdAt,
          displayName: c.displayName,
          photoURL: c.photoURL || null,
        }))
      );
    });
    return () => unsubscribe();
  }, [clipId]);

  const add = async (text: string) => {
    if (!user) return;
    const userForComment = {
      uid: user.uid,
      username: user.username,
      displayName: user.displayName || undefined, // Convert null to undefined if nede be (for TypeScript to be happy)
      photoURL: user.photoURL || undefined,
    };
    await addComment(clipId, userForComment, text);
  };

  const remove = async (commentId: string, commentUserId: string) => {
    if (!user) return;
    if (user.uid === commentUserId || user.uid === uploaderId) {
      await deleteComment(clipId, commentId);
    }
  };

  return { comments, add, remove };
}
