import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "../../decodeToken";
import { NextRequest, NextResponse } from "next/server";
import { NOTIFICATIONS_COLLECTION, USERS_COLLECTION } from "../../collections";
import { Notification } from "@/types/Notification";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const notifications = await db
      .collection(USERS_COLLECTION)
      .doc(uid)
      .collection(NOTIFICATIONS_COLLECTION)
      .orderBy("createdAt", "desc")
      .get();

    const notificationsData = notifications.docs.map((doc) => ({
      notificationId: doc.id,
      ...doc.data(),
    }));

    console.log(notificationsData);

    return NextResponse.json({ notificationsData }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
