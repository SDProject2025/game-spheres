import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "../../decodeToken";
import { db } from "@/config/firebaseAdminConfig";
import { ConversationInput } from "@/types/Conversation";
import { CONVERSATIONS_COLLECTION } from "../../collections";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const uid = await decodeToken(authHeader);

  if (!uid)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const snapshot = await db
      .collection(CONVERSATIONS_COLLECTION)
      .where("participants", "array-contains", uid)
      .orderBy("updatedAt", "desc")
      .orderBy("__name__", "desc")
      .get();

    const conversations: ConversationInput[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        conversationId: doc.id,
        lastMessage: data.lastMessage?.content || "",
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : "",
        participants: data.participants || [],
        unreadCounts: data.unreadCounts || {},
      };
    });

    return NextResponse.json({conversations}, {status: 200});
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to get conversations";
    console.error(message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
