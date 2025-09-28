import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "../../decodeToken";
import type { Notification } from "@/types/Notification";
import { NOTIFICATIONS_COLLECTION, USERS_COLLECTION } from "../../collections";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let notification: Notification;
  try {
    notification = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!notification || !notification.toUid) {
    return NextResponse.json(
      { message: "Missing recipient (toUid)" },
      { status: 400 }
    );
  }

  if (notification.type === "comment" && !notification.commentId) {
    return NextResponse.json(
      { message: "Missing commentId for comment notification" },
      { status: 400 }
    );
  }

  try {
    await db
      .collection(USERS_COLLECTION)
      .doc(notification.toUid)
      .collection(NOTIFICATIONS_COLLECTION)
      .add({
        ...notification,
        createdAt: Timestamp.now(),
        read: false,
      });

    return NextResponse.json(
      { message: "Notification created" },
      { status: 201 }
    );
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
