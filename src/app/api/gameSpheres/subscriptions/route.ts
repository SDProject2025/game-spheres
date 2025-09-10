import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import admin from "firebase-admin";
import { decodeToken } from "../../decodeToken";

// Check sub status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("Authorization");
    const userId = await decodeToken(authHeader);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const gameSphereId = searchParams.get("gameSphereId");

    if (!userId || !gameSphereId) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    const userRef = db.collection("users").doc(userId);
    const gsRef = db.collection("gamespheres").doc(gameSphereId);

    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User Not Found" }, { status: 400 });
    }

    const userData = userSnap.data();

    const isSubscribed = (
      (userData?.gsSubs || []) as admin.firestore.DocumentReference[]
    ).some((ref) => ref.path === gsRef.path);

    return NextResponse.json({ isSubscribed });
  } catch (error: unknown) {
    console.error("Error checking status:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// (Un)Subscribe
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-uid");
    const { gameSphereId, action } = await request.json();

    if (!userId || !gameSphereId || !action) {
      return NextResponse.json(
        { error: "UserID, GameSphereID, and Action are required" },
        { status: 400 }
      );
    }

    if (action !== "subscribe" && action !== "unsubscribe") {
      return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
    }

    const gsRef = db.collection("gamespheres").doc(gameSphereId);
    const userRef = db.collection("users").doc(userId);

    if (action === "subscribe") {
      const batch = db.batch();

      batch.update(userRef, {
        gsSubs: admin.firestore.FieldValue.arrayUnion(gsRef),
      });

      batch.update(gsRef, {
        subscribers: admin.firestore.FieldValue.arrayUnion(userRef),
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed",
        isSubscribed: true,
      });
    } else {
      // Unsubscribe
      const batch = db.batch();

      batch.update(gsRef, {
        subscribers: admin.firestore.FieldValue.arrayRemove(userRef),
      });

      batch.update(userRef, {
        gsSubs: admin.firestore.FieldValue.arrayRemove(gsRef),
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: "Succesfully unsibscribed",
        isSubscribed: false,
      });
    }
  } catch (error: unknown) {
    console.error(error);
    const errMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ errMessage }, { status: 500 });
  }
}
