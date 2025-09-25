"use client";
import { authFetch } from "@/config/authorisation";
import { Notification } from "@/types/Notification";
import { useEffect, useState } from "react";

export default function Inbox() {
  const [notifications, setNotifications] = useState<Notification[] | null>();
  useEffect(() => {
    async function fetchUnread() {
      const res = await authFetch("/api/notifications/get");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notificationsData);
        console.log(data.notificationsData);
      }
    }

    fetchUnread();
  }, []);

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <div className="w-full max-w-5xl mx-auto py-8 ml-64">
        <div className="flex gap-8 items-start">
            <ul>
                {notifications && notifications.map((notif) => {
                    return (
                        <li key={notif.notificationId}>
                            <div>
                                Sent by: {notif.fromUid}
                                Type: {notif.type}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
      </div>
    </div>
  );
}
