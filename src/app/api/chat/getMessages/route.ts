import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import {
  MESSAGES_COLLECTION,
  CONVERSATIONS_COLLECTION,
} from "../../collections";
import { MessageInput } from "@/types/Message";

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId)
    return NextResponse.json(
      { message: "Missing conversation id" },
      { status: 400 }
    );

  try {
    const snapshot = await db
      .collection(MESSAGES_COLLECTION)
      .where("conversationId", "==", conversationId)
      .orderBy("createdAt", "asc")
      .get();

    const messageData = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        messageId: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });

    return NextResponse.json({ messageData }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unable to get messages";
    return NextResponse.json({ message }, { status: 500 });
  }
}
