import { MessageCircleMore } from "lucide-react";
import { db } from "@/config/firebaseConfig";
import { useState, useEffect } from "react";
import { useUser } from "@/config/userProvider";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { CONVERSATIONS_COLLECTION } from "@/app/api/collections";

interface ChatIconProps {
  className?: string;
}

export default function ChatIcon({ className = "" }: ChatIconProps) {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        total += data.unreadCounts?.[user.uid] || 0;
      });

      setUnreadCount(total);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="relative inline-block">
      <MessageCircleMore className={`w-6 h-6 ${className}`} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-green-500 text-xs font-bold">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
