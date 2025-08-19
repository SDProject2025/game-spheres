import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

const USERS_COLLECTION = "users";

async function isUsernameTaken(username: string) {
  const snapshot = await db
    .collection(USERS_COLLECTION)
    .select("username")
    .where("username", "==", username)
    .get();

  return !snapshot.empty;
}

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username)
    return NextResponse.json(
      { message: "Username is required" },
      { status: 400 }
    );

  try {
    let count = 0;
    let candidate = username;
    while (await isUsernameTaken(candidate)) {
      candidate = `${username}${count++}`;
    }

    return NextResponse.json({ username: candidate }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { uid, username, displayName, email } = await request.json();
  console.log("Received: ", { uid, username, displayName, email });

  if (!uid || !username || !displayName || !email)
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );

  if (await isUsernameTaken(username))
    return NextResponse.json({ message: "Username is taken" }, { status: 409 });

  try {
    await db.collection(USERS_COLLECTION).doc(uid).set({
      username,
      displayName,
      email,
      followers: [],
      following: [],
      gsSubs: [],
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Sign up error:", e);
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
