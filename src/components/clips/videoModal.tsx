"use client";
import { useState, useEffect, useRef } from "react";
import { Clip } from "@/types/Clip";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import MuxVideoPlayer from "./muxVideoPlayer";
import { deleteDoc, doc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { HeartOff, Bookmark, BookmarkCheck, Heart, MessageCircle } from "lucide-react";
import { useUser } from "@/config/userProvider";
import toast from "react-hot-toast";
import { db } from "@/config/firebaseConfig";

interface VideoModalProps {
  clip: Clip;
  onClose: () => void;
  clipSaved?: boolean;
}

interface UserInfo {
  uid: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
}

export default function VideoModal({ clip, onClose, clipSaved }: VideoModalProps) {
  const [uploader, setUploader] = useState<UserInfo | null>(null);
  const [saved, setSaved] = useState(clipSaved);
  const modalRef = useRef<HTMLDivElement>(null);
  const { gameSpheres } = useGameSpheresContext();
  const [likesCount, setLikesCount] = useState<number>(clip.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useUser();

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    const checkSavedStatus = async () => {
      try {
        const res = await fetch(
          `/api/clips/savedClips?userId=${user?.uid}&clipId=${clip.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };
    checkSavedStatus();
  }, [user?.uid, clip.id]);

  const handleSaveClipClick = async (action: string) => {
    try {
      if (!clip || !user) {
        console.error("Clip and User fields are required");
        return;
      }
      const res = await fetch("/api/clips/savedClips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, clipId: clip.id, action }),
      });
      setSaved(action === "save");
      if (!res.ok) throw new Error("Error saving clip");
    } catch (error) {
      console.error("Error saving clip:", error);
    }
  };

  useEffect(() => {
    const clipRef = doc(db, "clips", clip.id);
    const unsubscribe = onSnapshot(clipRef, (docSnap) => {
      if (docSnap.exists()) setLikesCount(docSnap.data().likesCount || 0);
    });
    return () => unsubscribe();
  }, [clip.id]);

  useEffect(() => {
    if (!user?.uid) return;
    const checkLiked = async () => {
      try {
        const res = await fetch(`/api/clips/likes?userId=${user.uid}&clipId=${clip.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.isLiked);
        }
      } catch (err) {
        console.error("Error checking like status:", err);
      }
    };
    checkLiked();
  }, [user?.uid, clip.id]);

const handleLikeClick = async () => {
  if (!user?.uid || isLiking) return;
  setIsLiking(true);

  const action = isLiked ? "unlike" : "like";

  try {
    const res = await fetch("/api/clips/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, clipId: clip.id, action }),
    });

    if (!res.ok) {
      throw new Error("Failed to toggle like");
    }

    setIsLiked(!isLiked);
  } catch (err) {
    console.error("Error toggling like:", err);
  } finally {
    setIsLiking(false);
  }
};
  useEffect(() => {
    const commentsRef = collection(db, "clips", clip.id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    });
    return () => unsubscribe();
  }, [clip.id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.uid) return;
    try {
      const commentsRef = collection(db, "clips", clip.id, "comments");
      await addDoc(commentsRef, {
        userId: user.uid,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
        displayName: user.displayName || user.username || "Anonymous",
        photoURL: user.photoURL || null,
      });
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };
const handleDeleteComment = async (commentId: string, commentUserId: string) => {
  if (!user?.uid) return;

  // Allow only the comment owner OR the clip uploader to delete
  if (user.uid !== commentUserId && user.uid !== clip.uploadedBy) {
    toast.error("You can only delete your own comments.");
    return;
  }

  try {
    const commentRef = doc(db, "clips", clip.id, "comments", commentId);
    await deleteDoc(commentRef);
    toast.success("Comment deleted");
  } catch (err) {
    console.error("Error deleting comment:", err);
    toast.error("Failed to delete comment");
  }
};

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} className="bg-[#111] rounded-lg overflow-hidden max-w-6xl w-full max-h-[90vh] flex">
        <div className="flex-1 flex flex-col">
          <div className="aspect-video bg-black min-h-[400px]">
            {clip.processingStatus === "ready" && clip.muxPlaybackId ? (
              <MuxVideoPlayer playbackId={clip.muxPlaybackId} className="w-full h-full" poster={clip.thumbnailUrl} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                {clip.processingStatus === "preparing" && "Video is still processing..."}
                {clip.processingStatus === "errored" && "Error processing video"}
                {clip.processingStatus === "uploading" && "Upload in progress..."}
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">{clip.caption}</h1>
                <div className="flex items-center gap-4">
                 <button
  disabled={isLiking}
  onClick={handleLikeClick}
  className={`flex items-center gap-1 text-white transition ${
    isLiking ? "opacity-50 cursor-not-allowed" : "hover:text-[#00ffd5]"
  }`}
>
  {isLiked ? (
    <Heart className="text-[#00ffd5] fill-[#00ffd5]" />
  ) : (
    <Heart className="text-[#00ffd5]" />
  )}
  <span className="text-sm">{likesCount}</span>
</button>

                  {saved ? (
                    <BookmarkCheck className="cursor-pointer text-[#00ffd5]" onClick={() => handleSaveClipClick("unsave")} />
                  ) : (
                    <Bookmark className="cursor-pointer text-[#00ffd5]" onClick={() => handleSaveClipClick("save")} />
                  )}
                </div>
              </div>
              <div className="flex items-center text-gray-400 mt-1">
                <span className="text-[#00ffd5] font-medium">{getGameSphereName(clip.gameSphereId)}</span>
                <span className="mx-2">•</span>
                <span>{formatTimeSinceUpload(clip.uploadedAt)}</span>
              </div>
            </div>
            <div className="flex items-center mb-4 pb-4 border-b border-gray-700">
              {uploader?.photoURL && (
                <img src={uploader?.photoURL} alt={uploader?.displayName || uploader?.username || "User"} className="w-10 h-10 rounded-full object-cover mr-2" />
              )}
              <div>
                <p className="font-semibold text-white">{uploader?.displayName}</p>
                <p className="text-sm text-gray-400">Uploaded At: {clip.uploadedAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
       <div className="w-80 bg-[#1a1a1a] border-l border-gray-800 flex flex-col">
  {/* Header */}
  <div className="p-4 border-b border-gray-700 flex items-center gap-2">
    <MessageCircle className="text-gray-400" />
    <h2 className="text-lg font-semibold text-white">Comments</h2>
  </div>

  {/* Comment list */}
<div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(90vh-100px)]">
  {comments.length === 0 ? (
    <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
  ) : (
    comments.map((c) => (
      <div key={c.id} className="flex items-start gap-2 w-full group">
        {c.photoURL && (
          <img
            src={c.photoURL}
            alt={c.displayName}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white break-words break-all whitespace-pre-wrap">
            <span className="font-semibold">{c.displayName}</span>: {c.text}
          </p>
          <p className="text-xs text-gray-500">
            {c.createdAt?.toDate?.().toLocaleString?.() || "just now"}
          </p>
        </div>

        {/* Delete button (only visible if allowed) */}
        {(user?.uid === c.userId || user?.uid === clip.uploadedBy) && (
          <button
            onClick={() => handleDeleteComment(c.id, c.userId)}
            className="text-xs text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition"
          >
            Delete
          </button>
        )}
      </div>
    ))
  )}
</div>


  {/* Input */}
  <div className="p-3 border-t border-gray-700 flex gap-2">
    <input
      type="text"
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Add a comment..."
      className="flex-1 rounded-lg bg-[#222] text-white p-2 text-sm outline-none"
    />
    <button
      onClick={handleAddComment}
      className="px-3 py-1 bg-[#00ffd5] text-black font-medium rounded-lg hover:opacity-90"
    >
      Send
    </button>
  </div>
</div>

      </div>
    </div>
  );
}
