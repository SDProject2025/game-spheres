import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import type { Profile } from "@/types/Profile";
import { USERS_COLLECTION } from "../../collections";

export async function POST(request: NextRequest) {
  const uid = request.headers.get("x-user-uid");
  const body = await request.json();
  if (!body || !uid)
    return NextResponse.json({ message: "Missing post body" }, { status: 400 });
  const profile: Profile = body;
  console.log(uid);
  try {
    await db.collection(USERS_COLLECTION).doc(uid).update({
      displayName: profile.displayName,
      username: profile.username,
      bio: profile.bio,
      photoURL: profile.photoURL,
    });

    return NextResponse.json({success: true});
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error updating profile";
    console.error(message);
    return NextResponse.json({message}, {status: 500});
  }
}
