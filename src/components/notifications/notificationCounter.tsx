import { Mail } from "lucide-react";
import { db } from "@/config/firebaseConfig";
import { useState, useEffect } from "react";
import { useUser } from "@/config/userProvider";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { USERS_COLLECTION, NOTIFICATIONS_COLLECTION } from "@/app/api/collections";

export default function InboxIcon() {
    const { user } = useUser();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, USERS_COLLECTION, user.uid, NOTIFICATIONS_COLLECTION),
            where("read", "==", false)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.size);
        });

        return () => unsub();
    }, [user]);

  return (
    <div className="relative inline-block">
      <Mail className="w-6 h-6" data-testid="mail-icon" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-green-500 text-xs font-bold">
          {unreadCount}
        </span>
      )}
    </div>
  );
}