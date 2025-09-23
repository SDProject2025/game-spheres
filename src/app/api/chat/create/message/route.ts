import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import {
  USERS_COLLECTION,
  CONVERSATIONS_COLLECTION,
} from "@/app/api/collections";
import type { MessageInput } from "@/types/Message";
import type { Notification } from "@/types/Notification";
import {
  Timestamp,
  DocumentReference,
  WriteBatch,
} from "firebase-admin/firestore";
import { decodeToken } from "@/app/api/decodeToken";

export async function POST(request: NextRequest) {
  // verify sender token for security
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  // standard server side validation and input collection
  if (!uid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body)
    return NextResponse.json({ message: "Missing post body" }, { status: 400 });

  const message = body as MessageInput;

  try {
    // get a document reference to the current conversation
    const conversationRef = db
      .collection(CONVERSATIONS_COLLECTION)
      .doc(message.conversationId);

    const batch: WriteBatch = db.batch();
    const now = Timestamp.now(); // keep now as a constant for consistency across fields

    //get document reference to a new message within the messages subcollection
    const messageRef = conversationRef.collection("messages").doc();

    // add message creation to batch
    batch.set(messageRef, {
      content: message.content,
      senderId: message.senderId,
      createdAt: now,
    });

    // add new message as lastMessage to batch
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

    // pull conversation data to reference participants
    const conversationSnap = await conversationRef.get();
    const conversationData = conversationSnap.exists
      ? conversationSnap.data()
      : null;

    // filter out message sender from list of participants
    const participants: string[] = conversationData?.participants || [];
    const recipients = participants.filter((id) => id !== message.senderId);

    // create list of recipient document references
    const recipientRefs = recipients.map((id) =>
      db.collection(USERS_COLLECTION).doc(id)
    );

    // create type enforced notification
    const notification: Notification = {
      type: "message",
      fromUid: message.senderId,
      conversationId: message.conversationId,
      messageId: messageRef.id,
      createdAt: now,
      read: false
    }

    // for each recipient reference, create a document in the notifications subcollection
    for (const ref of recipientRefs) {
      const notifRef = ref.collection("notifications").doc();
      batch.set(notifRef, notification);
    }

    // finalise batch write
    await batch.commit();

    return NextResponse.json({
      success: true,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to post message";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
