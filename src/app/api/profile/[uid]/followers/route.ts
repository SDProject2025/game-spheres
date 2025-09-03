// app/api/profile/[uid]/followers/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  // Await the params before destructuring
  const { uid } = await params;
  
  if (!uid) return NextResponse.json({ users: [] });

  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return NextResponse.json({ users: [] });

    const data = userSnap.data();
    const followerIds: string[] = data.followers || [];

    if (followerIds.length === 0) return NextResponse.json({ users: [] });

    // Batch Firestore reads using the same efficient approach as your following route
    const chunks: string[][] = [];
    for (let i = 0; i < followerIds.length; i += 10) {
      chunks.push(followerIds.slice(i, i + 10));
    }

    const users: { id: string; username: string; displayName: string; avatar?: string }[] = [];

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