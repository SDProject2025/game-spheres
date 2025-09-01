import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebaseAdminConfig";
import {
  MESSAGES_COLLECTION,
  CONVERSATIONS_COLLECTION,
} from "../../collections";

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId)
    return NextResponse.json(
      { message: "Missing conversation id" },
      { status: 400 }
    );

  try {
    const convRef = db.collection(CONVERSATIONS_COLLECTION).doc(conversationId);
    const snapshot = await db
      .collection(MESSAGES_COLLECTION)
      .where("conversationId", "==", convRef)
      .orderBy("createdAt", "asc")
      .get();
    const messageData = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json({ messageData }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unable to get messages";
    return NextResponse.json({ message }, { status: 500 });
  }
}
