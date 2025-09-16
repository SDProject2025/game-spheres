import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import type { Profile } from "@/types/Profile";
import { USERS_COLLECTION } from "../../collections";
import { decodeToken } from "../../decodeToken";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body)
    return NextResponse.json({ message: "Missing post body" }, { status: 400 });
  const profile: Profile = body;
  console.log(profile.uid);
  try {
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
