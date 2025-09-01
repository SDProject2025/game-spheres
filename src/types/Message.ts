import { Timestamp, DocumentReference } from "firebase-admin/firestore";
import { Profile } from "./Profile";

export type MessageInput = {
    messageId?: string;
    content: string;
    conversationId: string;
    senderId: string;
};

export type MessageDoc = {
  content: string;
  conversationId: DocumentReference;  // Firestore ref
  senderId: DocumentReference<Profile>;
  createdAt: Timestamp;
};