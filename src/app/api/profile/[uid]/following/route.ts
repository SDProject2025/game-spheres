// app/api/profile/[uid]/following/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export async function GET(
  request: Request,
  { params }: { params: { uid: string } } // <-- params object
) {
  const { uid } = params;

  if (!uid) return NextResponse.json({ users: [] });

  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return NextResponse.json({ users: [] });

    const data = userSnap.data();
    const followingIds: string[] = data.following || [];

    if (followingIds.length === 0) return NextResponse.json({ users: [] });

    // Batch Firestore reads
    const chunks: string[][] = [];
    for (let i = 0; i < followingIds.length; i += 10) {
      chunks.push(followingIds.slice(i, i + 10));
    }

    const users: {
      id: string;
      username: string;
      displayName: string;
      avatar?: string;
    }[] = [];

    for (const chunk of chunks) {
      const q = query(collection(db, "users"), where("__name__", "in", chunk));
      const snap = await getDocs(q);
      snap.forEach((doc) => {
        const u = doc.data();
        users.push({
          id: doc.id,
          username: u.username,
          displayName: u.displayName,
          avatar: u.photoURL || "",
        });
      });
    }

    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ users: [] });
  }
}
