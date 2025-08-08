import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

const USERS_COLLECTION = "users";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  const snapshot = await db
    .collection(USERS_COLLECTION)
    .select()
    .where("username", "==", username)
    .get();

  if (snapshot.empty)
    return NextResponse.json(
      { message: "Username available" },
      { status: 200 }
    );
  else return NextResponse.json({ message: "Username taken" }, { status: 409 });
}
