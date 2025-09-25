import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import {
  USERS_COLLECTION,
  CONVERSATIONS_COLLECTION,
} from "@/app/api/collections";
import type { MessageInput } from "@/types/Message";
import type { Notification } from "@/types/Notification";
import { Timestamp, WriteBatch, FieldValue } from "firebase-admin/firestore";
import { decodeToken } from "@/app/api/decodeToken";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body)
    return NextResponse.json({ message: "Missing post body" }, { status: 400 });

  const message = body as MessageInput;

  try {
    const conversationRef = db
      .collection(CONVERSATIONS_COLLECTION)
      .doc(message.conversationId);

    const batch: WriteBatch = db.batch();
    const now = Timestamp.now();

    const convSnap = await conversationRef.get();
    const conversationData = convSnap.exists ? convSnap.data() : null;
    const participants: string[] = conversationData?.participants || [];

    const recipients = participants.filter((id) => id !== message.senderId);

    const messageRef = conversationRef.collection("messages").doc();
    batch.set(messageRef, {
      content: message.content,
      senderId: message.senderId,
      createdAt: now,
      read: false,
      recipientIds: recipients,
    });

    batch.set(
      conversationRef,
      {
        lastMessage: {
          id: messageRef.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: now,
        },
        updatedAt: now,
      },
      { merge: true }
    );

    const unreadCountsUpdate: Record<string, any> = {
      unreadCounts: {},
    };

    for (const recipientId of recipients) {
      unreadCountsUpdate.unreadCounts[recipientId] = FieldValue.increment(1);
    }

    batch.set(conversationRef, unreadCountsUpdate, { merge: true });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to post message";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}