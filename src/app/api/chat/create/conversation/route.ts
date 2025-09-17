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
import { ConversationInput } from "@/types/Conversation";
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

  const conversation = body as ConversationInput;

  try {
    if (conversation.participants.length === 2) {
      const [uidA, uidB] = conversation.participants;

      const snapshot = await db.collection(CONVERSATIONS_COLLECTION).where("participants", "array-contains", uidA).get();

      const existing = snapshot.docs.find((doc) => {
        const data = doc.data();
        const participants = data.participants as string[];
        return (
          participants.length === 2 &&
          participants.includes(uidA) &&
          participants.includes(uidB)
        );
      });

      if (existing) {
        // Return existing conversation instead of creating new one
        return NextResponse.json({
          success: true,
          conversationId: existing.id,
          existing: true,
        });
      }
    }
    
    const participantRefs = conversation.participants.map(
      (uid) =>
        db.collection(USERS_COLLECTION).doc(uid) as DocumentReference<Profile>
    );

    const conversationRef = db.collection(CONVERSATIONS_COLLECTION).doc();

    const batch: WriteBatch = db.batch();

    batch.set(conversationRef, {
      participants: conversation.participants, // just the array of UIDs
      updatedAt: Timestamp.now(),
    });

    for (const uid of conversation.participants) {
      const participantRef = db.collection(USERS_COLLECTION).doc(uid);
      batch.update(participantRef, {
        conversations: FieldValue.arrayUnion(conversationRef.id), // store doc ID instead of reference
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
