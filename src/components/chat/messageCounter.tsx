import { Mail } from "lucide-react";
import { db } from "@/config/firebaseConfig";
import { useState, useEffect } from "react";
import { useUser } from "@/config/userProvider";
import { collection, onSnapshot, query } from "firebase/firestore";
import { CONVERSATIONS_COLLECTION } from "@/app/api/collections";

export default function ChatIcon() {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, CONVERSATIONS_COLLECTION));

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
      <Mail className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-green-500 text-xs font-bold">
          {unreadCount}
        </span>
      )}
    </div>
  );
}