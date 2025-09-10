import { decodeToken } from "@/app/api/decodeToken";
import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

const USERS_COLLECTION = "users";

async function checkUsernameAvailable(username: string) {
  const snapshot = await db
    .collection(USERS_COLLECTION)
    .where("username", "==", username)
    .get();

  return snapshot.empty;
}

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json({ message: "Missing username" }, { status: 400 });
  }

  if (await checkUsernameAvailable(username)) {
    return NextResponse.json(
      { message: "Username available" },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ message: "Username taken" }, { status: 409 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid) {
    return NextResponse.json({ message: "Unauthorized" }, {status: 401});
  }

  const { username, displayName, email } = await request.json();

  if (!username || !displayName || !email) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!(await checkUsernameAvailable(username))) {
    return NextResponse.json({ message: "Username is taken" }, { status: 409 });
  }

  try {
    await db.collection(USERS_COLLECTION).doc(uid).set({
      username,
      displayName,
      email,
      followers: [],
      following: [],
      gsSubs: [],
      photoURL:
        "https://firebasestorage.googleapis.com/v0/b/game-spheres.firebasestorage.app/o/profilePhotos%2Fdefault_avatar.png?alt=media&token=e9eb0302-6064-4757-9c81-227a32f45b54",
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Sign up error:", e);
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
