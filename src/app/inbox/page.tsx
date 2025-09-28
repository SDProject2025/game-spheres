"use client";
import { authFetch } from "@/config/authorisation";
import { Notification } from "@/types/Notification";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useUser } from "@/config/userProvider";
import NotificationsPage from "@/components/notifications/forms/notificationPage";
import type { Profile } from "@/types/Profile";
import { Clip } from "@/types/Clip";
import { CLIPS_COLLECTION, USERS_COLLECTION } from "../api/collections";
import VideoModal from "@/components/clips/videoModal";

export default function Inbox() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  async function fetchNotifications() {
    const res = await authFetch("/api/notifications/get");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notificationsData);
    }
  }

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    async function fetchProfiles() {
      if (!notifications) return;

      const uids = Array.from(new Set(notifications.map((n) => n.fromUid)));

      const map: Record<string, Profile> = { ...profiles };
      await Promise.all(
        uids.map(async (uid) => {
          if (!map[uid]) {
            const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
            if (snap.exists()) {
              const data = snap.data();
              map[uid] = {
                uid,
                displayName: data.displayName || "",
                username: data.username || uid,
                bio: data.bio || "",
                following: data.following || [],
                followers: data.followers || [],
                photoURL: data.photoURL || "",
              } satisfies Profile;
            }
          }
        })
      );
      setProfiles(map);
    }

    if (notifications.length > 0) fetchProfiles();
  }, [notifications]);

  async function getComment(postId: string, commentId: string) {
    const commentRef = doc(db, CLIPS_COLLECTION, postId, "comments", commentId);
    const snap = await getDoc(commentRef);

    if (!snap.exists()) {
      throw new Error(`Comment ${commentId} not found on post ${postId}`);
    }

    return snap.data().text;
  }

  async function getClip(postId: string): Promise<Clip> {
    const clipRef = doc(db, CLIPS_COLLECTION, postId);
    const snap = await getDoc(clipRef);

    if (!snap.exists()) {
      throw new Error(`Clip ${postId} not found`);
    }

    const data = snap.data();

    const clip = {
      ...data,
      id: snap.id,
      uploadedAt: data.uploadedAt.toDate(),
    } as Clip;

    return clip;
  }

  async function markRead() {
    const unreadNotifs = notifications.filter((notif) => notif.read === false);
    try {
      const res = await authFetch("/api/notifications/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(unreadNotifs),
      });

      if (res.ok) fetchNotifications();
    } catch (e) {
      console.error(e instanceof Error ? e.message : "Couldn't mark read");
    }
  }

  const handlePlayClip = (clip: Clip) => {
    setSelectedClip(clip);
  };

  const handleCloseModal = () => {
    setSelectedClip(null);
  };

  if (!user || !notifications || !profiles) return <h1>Loading...</h1>;

  return (
    <>
      <NotificationsPage
        notifications={notifications}
        profiles={profiles}
        getComment={getComment}
        getClip={getClip}
        handlePlayClip={handlePlayClip}
        markRead={markRead}
      />

      {selectedClip && (
        <VideoModal clip={selectedClip} onClose={handleCloseModal} />
      )}
    </>
  );
}
