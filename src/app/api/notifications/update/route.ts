import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "../../decodeToken";
import { NextRequest, NextResponse } from "next/server";
import { WriteBatch } from "firebase-admin/firestore";
import { Notification } from "@/types/Notification";
import { USERS_COLLECTION, NOTIFICATIONS_COLLECTION } from "../../collections";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const unreadNotifs: Notification[] = await request.json();

  if (!unreadNotifs)
    return NextResponse.json(
      { message: "Missing notifications" },
      { status: 400 }
    );

  try {
    const batch: WriteBatch = db.batch();

    unreadNotifs.forEach((notif) => {
      if (notif.notificationId) {
        const notifRef = db
          .collection(USERS_COLLECTION)
          .doc(uid)
          .collection(NOTIFICATIONS_COLLECTION)
          .doc(notif.notificationId);

        batch.update(notifRef, {
          read: true,
        });
      }
    });

    await batch.commit();

    return NextResponse.json({ status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
