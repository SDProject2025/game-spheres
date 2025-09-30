import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import type { Profile } from "@/types/Profile";
import { USERS_COLLECTION } from "../../collections";
import { decodeToken } from "../../decodeToken";
import {
  BAD_REQUEST_STATUS,
  CONFLICT_STATUS,
  UNAUTHORIZED_STATUS,
} from "../../httpCodes";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: UNAUTHORIZED_STATUS }
    );
  }

  const body = await request.json();
  if (!body) {
    return NextResponse.json(
      { message: "Missing post body" },
      { status: BAD_REQUEST_STATUS }
    );
  }

  const profile: Profile = body;

  try {
    // Check if username is taken by someone *else*
    const userSnap = await db
      .collection(USERS_COLLECTION)
      .where("username", "==", profile.username)
      .get();

    const conflict = userSnap.docs.some((doc) => doc.id !== profile.uid);

    if (conflict) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: CONFLICT_STATUS }
      );
    }

    // Safe to update
    await db.collection(USERS_COLLECTION).doc(profile.uid).update({
      displayName: profile.displayName,
      username: profile.username,
      bio: profile.bio,
      photoURL: profile.photoURL,
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error updating profile";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
