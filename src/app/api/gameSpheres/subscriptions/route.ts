import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  DocumentReference,
} from "firebase/firestore";
import { headers } from "next/headers";

// Check sub status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const gameSphereId = searchParams.get("gameSphereId");

    if (!userId || !gameSphereId) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    const userRef = doc(db, "users", userId);
    const gsRef = doc(db, "gamespheres", gameSphereId);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User Not Found" }, { status: 400 });
    }

    const userData = userSnap.data();

    const isSubscribed = ((userData.gsSubs || []) as DocumentReference[]).some(
      (ref) => ref.path === gsRef.path
    );

    console.log("Is Subscribed:", isSubscribed);

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
    const { userId, gameSphereId, action } = await request.json();

    console.log(
      "User ID, GameSphere ID, Action:",
      userId,
      gameSphereId,
      action
    );

    if (!userId || !gameSphereId || !action) {
      return NextResponse.json(
        { error: "UserID, GameSphereID, and Action are required" },
        { status: 400 }
      );
    }

    if (action !== "subscribe" && action !== "unsubscribe") {
      return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
    }

    const gsRef = doc(db, "gamespheres", gameSphereId);
    const userRef = doc(db, "users", userId);

    if (action === "subscribe") {
      const batch = writeBatch(db);

      batch.update(userRef, {
        gsSubs: arrayUnion(gsRef),
      });

      batch.update(gsRef, {
        subscribers: arrayUnion(userRef),
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed",
        isSubscribed: true,
      });
    } else {
      // Unsubscribe
      await updateDoc(gsRef, {
        subscribers: arrayRemove(userRef),
      });

      await updateDoc(userRef, {
        gsSubs: arrayRemove(gsRef),
      });

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
