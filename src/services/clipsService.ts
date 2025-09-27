import { authFetch } from "@/config/authorisation";
import type { Notification } from "@/types/Notification";
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
  getDoc,
} from "firebase/firestore";
import { CLIPS_COLLECTION, USERS_COLLECTION } from "@/app/api/collections";

export const fetchUploader = async (uid: string) => {
  const res = await fetch(`/api/profile?uid=${uid}`);
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
};

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
  callback: (comments: any[]) => void
) => {
  const commentsRef = collection(db, "clips", clipId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const commentsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(commentsData);
  });
};

export const addComment = async (clipId: string, user: any, text: string) => {
  const commentsRef = collection(db, CLIPS_COLLECTION, clipId, "comments");

  try {
    const commentDoc = await addDoc(commentsRef, {
      userId: user.uid,
      text,
      createdAt: serverTimestamp(),
      displayName: user.displayName || user.username || "Anonymous",
      photoURL: user.photoURL || null,
    });

    const clipSnap = await getDoc(doc(db, CLIPS_COLLECTION, clipId));
    if (!clipSnap.exists()) return commentDoc;

    const clipData = clipSnap.data();

    const notification: Notification = {
      type: "comment",
      commentId: commentDoc.id,
      fromUid: user.uid,
      toUid: clipData.uploadedBy,
      postId: clipId,
      read: false,
    };

    try {
      const res = await authFetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      });

      if (!res.ok) console.error("Failed to create notification");
    } catch (e) {
      console.error("Error posting notification:", e);
    }

    return commentDoc;
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
  }
};

export const deleteComment = async (clipId: string, commentId: string) => {
  const commentRef = doc(db, "clips", clipId, "comments", commentId);
  return deleteDoc(commentRef);
};
