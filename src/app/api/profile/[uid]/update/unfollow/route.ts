import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { decodeToken } from "@/app/api/decodeToken";

const USERS_COLLECTION = "users";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const followerUid = await decodeToken(authHeader);

    if (!followerUid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
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
