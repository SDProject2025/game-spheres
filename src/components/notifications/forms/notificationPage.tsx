import type { Profile } from "@/types/Profile";
import type { User } from "@/components/profile/forms/followList";
import type { Notification } from "@/types/Notification";
import NotificationList from "./notificationList";
import { Clip } from "@/types/Clip";

type Props = {
  notifications: Notification[];
  profiles: Record<string, Profile>;
  getComment: (postId: string, commentId: string) => Promise<string>;
  getClip: (postId: string) => Promise<Clip>;
  handlePlayClip: (clip: Clip) => void;
};

export default function NotificationsPage({
  notifications,
  profiles,
  getComment,
  getClip,
  handlePlayClip
}: Props) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Recent Notifications:</h1>
      </div>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet.</p>
      )}

      <NotificationList
        notifications={notifications}
        profiles={profiles}
        getComment={getComment}
        getClip={getClip}
        handlePlayClip={handlePlayClip}
      />
    </div>
  );
}
