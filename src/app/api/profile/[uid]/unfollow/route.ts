import { db, auth as adminAuth } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

const USERS_COLLECTION = "users";

export async function POST(request: NextRequest) {
  try {
    const followerUid = request.headers.get("x-user-uid");
    const followeeUid = request.nextUrl.pathname.split("/")[3];

    if (!followerUid)
      return NextResponse.json(
        { message: "Missing auth token" },
        { status: 400 }
      );

    await db
      .collection(USERS_COLLECTION)
      .doc(followeeUid)
      .update({
        followers: admin.firestore.FieldValue.arrayRemove(followerUid),
      });

    await db
      .collection(USERS_COLLECTION)
      .doc(followerUid)
      .update({
        following: admin.firestore.FieldValue.arrayRemove(followeeUid),
      });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
