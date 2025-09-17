import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(request: NextRequest) {
  // TODO: Update to handle both save/unsave requests
  try {
    const { userId, clipId, action } = await request.json();

    if (!userId || !clipId || !action) {
      return NextResponse.json(
        { error: "User ID, Clip ID, or action not given" },
        { status: 400 }
      );
    }

    if (action !== "save" && action !== "unsave") {
      return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
    }

    if (action === "save") {
      await db
        .collection("users")
        .doc(userId)
        .update({
          savedClips: admin.firestore.FieldValue.arrayUnion(clipId),
        });
    }

    if (action === "unsave") {
      await db
        .collection("users")
        .doc(userId)
        .update({
          savedClips: admin.firestore.FieldValue.arrayRemove(clipId),
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating clip save status:", error);
    return NextResponse.json(
      { error: "Updating clip save status failed" },
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
        { error: "Error: User and/or Clip ID not provided" },
        { status: 400 }
      );
    }

    const userRef = db.collection("users").doc(userId);

    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();

    // Needed for support for older users, who dont have the savedClips field just yet
    const savedClips = Array.isArray(userData?.savedClips)
      ? userData.savedClips
      : [];

    const isSaved = savedClips.includes(clipId);

    return NextResponse.json({ isSaved });
  } catch (error) {
    console.error("Error checking saved status:", error);
    return NextResponse.json(
      { error: "Failed to check saved status" },
      { status: 500 }
    );
  }
}
