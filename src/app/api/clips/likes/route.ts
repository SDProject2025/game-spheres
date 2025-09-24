import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";


export async function POST(request: NextRequest) {
  try {
    const { userId, clipId, action } = await request.json();

    if (!userId || !clipId || !action) {
      return NextResponse.json(
        { error: "User ID, Clip ID, or action not provided" },
        { status: 400 }
      );
    }

    if (action !== "like" && action !== "unlike") {
      return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
    }

    const clipRef = db.collection("clips").doc(clipId);
    const likeRef = clipRef.collection("likes").doc(userId);

    await db.runTransaction(async (transaction) => {
      const likeSnap = await transaction.get(likeRef);

      if (action === "like" && !likeSnap.exists) {
        transaction.set(likeRef, {
          likedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        transaction.update(clipRef, {
          likesCount: admin.firestore.FieldValue.increment(1),
        });
      }

      if (action === "unlike" && likeSnap.exists) {
        transaction.delete(likeRef);
        transaction.update(clipRef, {
          likesCount: admin.firestore.FieldValue.increment(-1),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating like status:", error);
    return NextResponse.json(
      { error: "Updating like status failed" },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const clipId = searchParams.get("clipId");

    if (!userId || !clipId) {
      return NextResponse.json(
        { error: "User ID and Clip ID are required" },
        { status: 400 }
      );
    }

    const likeRef = db
      .collection("clips")
      .doc(clipId)
      .collection("likes")
      .doc(userId);
    const likeSnap = await likeRef.get();

    const isLiked = likeSnap.exists;

    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 }
    );
  }
}
