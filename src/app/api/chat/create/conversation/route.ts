import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import {
  USERS_COLLECTION,
  CONVERSATIONS_COLLECTION,
} from "@/app/api/collections";
import {
  Timestamp,
  DocumentReference,
  FieldValue,
  WriteBatch,
} from "firebase-admin/firestore";
import { Profile } from "@/types/Profile";
import { ConversationDoc, ConversationInput } from "@/types/Conversation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body)
    return NextResponse.json({ message: "Missing post body" }, { status: 400 });

  const conversation = body as ConversationInput;

  try {
    const participantRefs = conversation.participants.map(
      (uid) =>
        db.collection(USERS_COLLECTION).doc(uid) as DocumentReference<Profile>
    );

    const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc();

    const batch: WriteBatch = db.batch();

    batch.set(conversationRef, {
      participants: participantRefs,
      updatedAt: Timestamp.now(),
    });

    for (let participant of participantRefs) {
      batch.update(participant, {
        conversations: FieldValue.arrayUnion(conversationRef),
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to post conversation";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
