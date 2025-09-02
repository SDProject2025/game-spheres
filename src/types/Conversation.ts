import { Timestamp, DocumentReference } from "firebase-admin/firestore";
import { Profile } from "./Profile";
import { MessageDoc } from "./Message";

export type ConversationInput = {
  conversationId?: string;
  lastMessage: string;
  participants: string[];
  updatedAt: string;
};

export type ConversationDoc = {
  conversationId: DocumentReference;
  lastMessage: DocumentReference<MessageDoc>;
  participants: DocumentReference<Profile>[];
  updatedAt: Timestamp;
};