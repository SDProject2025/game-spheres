import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";

const USERS_COLLECTION = "users";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query)
    return NextResponse.json({ message: "Missing query" }, { status: 400 });

  try {
    const snapshot = await db
      .collection(USERS_COLLECTION)
      .where("username", ">=", query)
      .where("username", "<", query + "\uf8ff")
      .get();
    const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    console.log(users);
    return NextResponse.json({ users }, { status: 200 });
  } catch (e: unknown) {
    console.log("Error fetching users:", e);
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}