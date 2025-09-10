import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import {
  USERS_COLLECTION,
  CONVERSATIONS_COLLECTION,
} from "@/app/api/collections";
import { MessageInput } from "@/types/Message";
import {
  Timestamp,
  DocumentReference,
  WriteBatch,
  FieldValue,
} from "firebase-admin/firestore";
import { Profile } from "@/types/Profile";
import { decodeToken } from "@/app/api/decodeToken";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
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

    const batch: WriteBatch = db.batch();
    const now = Timestamp.now();

    const messageRef = conversationRef.collection("messages").doc();
    batch.set(messageRef, {
      content: message.content,
      senderId: message.senderId,
      createdAt: now,
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

    batch.set(
      senderRef,
      {
        messages: FieldValue.arrayUnion(messageRef.id),
      },
      { merge: true }
    );

    await batch.commit();

    const conversationSnap = await conversationRef.get();
    const conversationData = conversationSnap.exists
      ? conversationSnap.data()
      : null;

    return NextResponse.json({
      success: true,
      messageId: messageRef.id,
      conversation: conversationData,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to post message";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
