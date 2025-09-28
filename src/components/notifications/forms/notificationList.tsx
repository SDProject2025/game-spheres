"use client";
import type { Notification } from "@/types/Notification";
import type { Profile } from "@/types/Profile";
import { useEffect, useState } from "react";
import NotificationItem from "../notificationItem";
import { Clip } from "@/types/Clip";

type Props = {
  notifications: Notification[];
  profiles: Record<string, Profile>;
  getComment: (postId: string, commentId: string) => Promise<string>;
  getClip: (postId: string) => Promise<Clip>;
  handlePlayClip: (clip: Clip) => void;
};

export default function NotificationList({
  notifications,
  profiles,
  getComment,
  getClip,
  handlePlayClip
}: Props) {
  const [enhancedNotifs, setEnhancedNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    async function enrich() {
      const updated = await Promise.all(
        notifications.map(async (notif) => {
          if ((notif.type === "comment" || notif.type === "like") && notif.postId) {
            const clip = await getClip(notif.postId);
            notif.clip = clip;
          }

          if (notif.type === "comment" && notif.commentId && notif.postId) {
            const content = await getComment(notif.postId, notif.commentId);
            return { ...notif, commentContent: content };
          }
          return notif;
        })
      );
      setEnhancedNotifs(updated);
    }
    enrich();
  }, [notifications, getComment]);

  return (
    <ul className="space-y-2">
      {enhancedNotifs.map((notif) => (
        <li key={notif.notificationId}>
          <div
            className={`block p-4 ${
              notif.read
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-green-800 hover:bg-green-700"
            } text-white rounded-lg transition`}
          >
            <NotificationItem notif={notif} profiles={profiles} handlePlayClip={handlePlayClip}/>
          </div>
        </li>
      ))}
    </ul>
  );
}
