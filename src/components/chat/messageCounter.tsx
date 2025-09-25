import { MessageCircleMore } from "lucide-react";
import { db } from "@/config/firebaseConfig";
import { useState, useEffect } from "react";
import { useUser } from "@/config/userProvider";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { CONVERSATIONS_COLLECTION } from "@/app/api/collections";

export default function ChatIcon() {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Only fetch conversations where user is a participant
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(data.unreadCounts?.[user.uid]);
        total += data.unreadCounts?.[user.uid] || 0;
      });

      console.log("unread total:", total);
      setUnreadCount(total);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="relative inline-block">
      <MessageCircleMore className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-green-500 text-xs font-bold">
          {unreadCount}
        </span>
      )}
    </div>
  );
}