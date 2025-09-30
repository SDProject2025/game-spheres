import { db } from "@/config/firebaseAdminConfig";
import { decodeToken } from "@/app/api/decodeToken";
import { NextRequest, NextResponse } from "next/server";
import { WriteBatch } from "firebase-admin/firestore";
import { MessageInput } from "@/types/Message";
import {
  CONVERSATIONS_COLLECTION,
  MESSAGES_COLLECTION,
} from "@/app/api/collections";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const unreadMessages: MessageInput[] = await request.json();
  if (!unreadMessages) {
    return NextResponse.json({ message: "Missing messages" }, { status: 400 });
  }

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

        batch.update(msgRef, { read: true });

        convCountsToUpdate[msg.conversationId] =
          (convCountsToUpdate[msg.conversationId] || 0) + 1;
      }
    });

    await batch.commit();

    const txs = Object.entries(convCountsToUpdate).map(
      async ([conversationId, count]) => {
        const convRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);

        return db.runTransaction(async (transaction) => {
          const snap = await transaction.get(convRef);
          if (!snap.exists) return;

          const data = snap.data();
          const current = data?.unreadCounts?.[uid] || 0;
          const newValue = Math.max(0, current - count);

          transaction.update(convRef, {
            [`unreadCounts.${uid}`]: newValue,
          });
        });
      }
    );

    await Promise.all(txs);

    return NextResponse.json({ status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
