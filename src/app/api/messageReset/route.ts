import { db } from "@/config/firebaseAdminConfig";
import { CONVERSATIONS_COLLECTION, MESSAGES_COLLECTION } from "@/app/api/collections";
import { WriteBatch } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

async function resetUnreadAndMarkRead() {
  const convSnap = await db.collection(CONVERSATIONS_COLLECTION).get();
  const batchSize = 500;
  let batch: WriteBatch = db.batch();
  let ops = 0;

  for (const convDoc of convSnap.docs) {
    // 1️⃣ Reset unreadCounts
    batch.update(convDoc.ref, { unreadCounts: {} });
    ops++;

    // 2️⃣ Mark all messages as read
    const messagesSnap = await convDoc.ref.collection(MESSAGES_COLLECTION).get();
    for (const msgDoc of messagesSnap.docs) {
      batch.update(msgDoc.ref, { read: true });
      ops++;

      // Commit batch if limit reached
      if (ops >= batchSize) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }

    // Commit batch after finishing this conversation if batch has pending ops
    if (ops > 0) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  console.log("All unreadCounts reset and messages marked as read.");
}

export async function GET() {
  try {
    await resetUnreadAndMarkRead();
    return NextResponse.json({ message: "done" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to reset" }, { status: 500 });
  }
}