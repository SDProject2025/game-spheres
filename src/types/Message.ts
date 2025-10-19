import { Timestamp, DocumentReference } from "firebase-admin/firestore";
import { Profile } from "./Profile";

export type MessageInput = {
  type: "text" | "clip";
  messageId?: string;
  content: string;
  conversationId: string;
  senderId: string;
  createdAt: string;
  read: boolean;
};

export type MessageDoc = {
  content: string;
  conversationId: DocumentReference; // Firestore ref
  senderId: DocumentReference<Profile>;
  createdAt: Timestamp;
  read: boolean;
};
