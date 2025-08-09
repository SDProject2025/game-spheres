import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

const USERS_COLLECTION = "users";

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");

  if (!uid)
    return NextResponse.json({ message: "Missing uid" }, { status: 400 });
  const snapshot = await db.collection(USERS_COLLECTION).doc(uid).get();

  if (snapshot.get("verified"))
    return NextResponse.json({ message: "User verified" }, { status: 200 });
  else
    return NextResponse.json({ message: "User not verified" }, { status: 401 });
}
