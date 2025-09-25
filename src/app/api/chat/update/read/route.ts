import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "@/app/api/decodeToken";
import { NextRequest, NextResponse } from "next/server";
import { WriteBatch, FieldValue } from "firebase-admin/firestore";
import { MessageInput } from "@/types/Message";
import {
  CONVERSATIONS_COLLECTION,
  MESSAGES_COLLECTION,
} from "@/app/api/collections";

// TODO: chunk messages into multiple batches if more than 500 in request
export async function POST(request: NextRequest) {
  console.log("Mark read API hit");
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const unreadMessages: MessageInput[] = await request.json();

  if (!unreadMessages)
    return NextResponse.json({ message: "missing messages" }, { status: 400 });

  try {
    const batch: WriteBatch = db.batch();
    const convCountsToUpdate: Record<string, number> = {};

    unreadMessages.forEach((msg) => {
      if (msg.senderId !== uid && msg.messageId) {
        const msgRef = db
          .collection(CONVERSATIONS_COLLECTION)
          .doc(msg.conversationId)
          .collection(MESSAGES_COLLECTION)
          .doc(msg.messageId);

        batch.update(msgRef, {
          read: true,
        });

        convCountsToUpdate[msg.conversationId] =
          (convCountsToUpdate[msg.conversationId] || 0) + 1;
      }
    });

    for (const [conversationId, count] of Object.entries(convCountsToUpdate)) {
      const convRef = db
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId);

      batch.update(convRef, {
        [`unreadCounts.${uid}`]: FieldValue.increment(-count),
      });
    }

    await batch.commit();

    return NextResponse.json({ status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
