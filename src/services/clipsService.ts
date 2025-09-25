import { db } from "@/config/firebaseConfig";
import {
  doc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { Comment } from "@/types/Comment";

export const fetchUploader = async (uid: string) => {
  const res = await fetch(`/api/profile?uid=${uid}`);
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
};

interface User {
  uid?: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
}

export const checkSavedStatus = async (userId: string, clipId: string) => {
  const res = await fetch(
    `/api/clips/savedClips?userId=${userId}&clipId=${clipId}`
  );
  if (!res.ok) throw new Error("Failed to check saved status");
  return res.json();
};

export const toggleSaveClip = async (
  userId: string,
  clipId: string,
  action: "save" | "unsave"
) => {
  return fetch("/api/clips/savedClips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, clipId, action }),
  });
};

export const toggleLikeClip = async (
  userId: string,
  clipId: string,
  action: "like" | "unlike"
) => {
  return fetch("/api/clips/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, clipId, action }),
  });
};

export const listenToLikes = (
  clipId: string,
  callback: (count: number) => void
) => {
  const clipRef = doc(db, "clips", clipId);
  return onSnapshot(clipRef, (docSnap) => {
    if (docSnap.exists()) callback(docSnap.data().likesCount || 0);
  });
};

export const listenToComments = (
  clipId: string,
  callback: (comments: Comment[]) => void
) => {
  const commentsRef = collection(db, "clips", clipId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const commentsData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        text: data.text,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        displayName: data.displayName,
        photoURL: data.photoURL ?? null,
      } as Comment;
    });
    callback(commentsData);
  });
};

export const addComment = async (clipId: string, user: User, text: string) => {
  const commentsRef = collection(db, "clips", clipId, "comments");
  return addDoc(commentsRef, {
    userId: user.uid,
    text,
    createdAt: serverTimestamp(),
    displayName: user.displayName || user.username || "Anonymous",
    photoURL: user.photoURL || null,
  });
};

export const deleteComment = async (clipId: string, commentId: string) => {
  const commentRef = doc(db, "clips", clipId, "comments", commentId);
  return deleteDoc(commentRef);
};
