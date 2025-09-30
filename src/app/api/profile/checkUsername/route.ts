import { decodeToken } from "@/app/api/decodeToken";
import { db } from "@/config/firebaseAdminConfig";
import { NextRequest, NextResponse } from "next/server";
import {
  BAD_REQUEST_STATUS,
  CONFLICT_STATUS,
  OK_STATUS,
  UNAUTHORIZED_STATUS,
} from "../../httpCodes";
import { USERS_COLLECTION } from "../../collections";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);
  const username = request.nextUrl.searchParams.get("username");

  if (!uid)
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: UNAUTHORIZED_STATUS }
    );

  if (!username)
    return NextResponse.json(
      { message: "Missing username" },
      { status: BAD_REQUEST_STATUS }
    );

  const snapshot = await db
    .collection(USERS_COLLECTION)
    .where("username", "==", username)
    .get();

  const conflict = snapshot.docs.some((doc) => doc.id !== uid);

  if (conflict)
    return NextResponse.json(
      { message: "Username taken" },
      { status: CONFLICT_STATUS }
    );
  else
    return NextResponse.json(
      { message: "Username available" },
      { status: OK_STATUS }
    );
}
