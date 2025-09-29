import type { Notification } from "@/types/Notification";
import type { Profile } from "@/types/Profile";
import { ReactNode } from "react";
import { Clip } from "@/types/Clip";
import { useRouter } from "next/navigation";

type Props = {
  notif: Notification;
  profiles: Record<string, Profile>;
  handlePlayClip: (clip: Clip) => void;
};

export default function NotificationItem({ notif, profiles, handlePlayClip }: Props) {
  const router = useRouter();
  const notifSender = profiles[notif.fromUid];
  if (!notifSender) return <h1>Problem</h1>;
  const username = notifSender.username;
  const isClipNotification = notif.type === "comment" || notif.type === "like";

  if (!notifSender || isClipNotification === undefined) return <h1>Problem</h1>

  let message: ReactNode = "";
  if (notif.type === "comment") {
    message = (
      <>
        <strong>{username}</strong> commented on your post:
        <br />"{notif.commentContent}"
      </>
    );
  } else if (notif.type === "follow") {
    message = (
      <>
        <strong>{username}</strong> started following you.
      </>
    );
  } else if (notif.type === "like") {
    message = (
      <>
        <strong>{username}</strong> liked your post.
      </>
    );
  }

  return (
      <div className="flex items-start" onClick={() => {
        if (isClipNotification && notif.clip) handlePlayClip(notif.clip);
        else router.push(`/profile/${notif.fromUid}`)
      }}>
        <img
          src={notifSender.photoURL}
          className="w-12 h-12 object-cover rounded-full"
        />
        <div className="flex flex-col pl-2">
          <span>{message}</span>
          <span className="text-sm text-gray-400">
            {notif.createdAt
              ? new Intl.DateTimeFormat([], {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(notif.createdAt))
              : ""}
          </span>
        </div>
      </div>
  );
}
