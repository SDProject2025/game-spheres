import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import {
  USERS_COLLECTION,
  MESSAGES_COLLECTION,
  CONVERSATIONS_COLLECTION,
} from "@/app/api/collections";
import { MessageInput } from "@/types/Message";
import {
  Timestamp,
  DocumentReference,
  FieldValue,
  WriteBatch,
} from "firebase-admin/firestore";
import { Profile } from "@/types/Profile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body)
    return NextResponse.json({ message: "Missing post body" }, { status: 400 });

  const message = body as MessageInput;

  try {
    const conversationRef = db
      .collection(CONVERSATIONS_COLLECTION)
      .doc(message.conversationId);
    const senderRef = db
      .collection(USERS_COLLECTION)
      .doc(message.senderId) as DocumentReference<Profile>;

    const messageRef = db.collection(MESSAGES_COLLECTION).doc();

    const batch: WriteBatch = db.batch();

    batch.set(messageRef, {
      content: message.content,
      conversationId: conversationRef,
      senderId: senderRef,
      createdAt: Timestamp.now(),
    });

    batch.update(conversationRef, {
      lastMessage: messageRef,
      updatedAt: Timestamp.now(),
    });

    batch.update(senderRef, {
      messages: FieldValue.arrayUnion(messageRef),
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to post message";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
