import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

const USERS_COLLECTION = "users";

async function checkUsernameAvailable(username: string) {
  const snapshot = await db
    .collection(USERS_COLLECTION)
    .select()
    .where("username", "==", username)
    .get();

  return snapshot.empty;
}

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username)
    return NextResponse.json({ message: "Missing username" }, { status: 400 });

  if (await checkUsernameAvailable(username))
    return NextResponse.json(
      { message: "Username available" },
      { status: 200 }
    );
  else return NextResponse.json({ message: "Username taken" }, { status: 409 });
}

export async function POST(request: NextRequest) {
  const { uid, username, displayName, email } = await request.json();

  if (!uid || !username || !displayName || !email)
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );

  if (!(await checkUsernameAvailable(username)))
    return NextResponse.json({ message: "Username is taken" }, { status: 409 });

  try {
    await db.collection(USERS_COLLECTION).doc(uid).set({
      username,
      displayName,
      email,
      followers: [],
      following: [],
      gsSubs: []
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Sign up error:", e);
    return NextResponse.json(
      { message: e.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
