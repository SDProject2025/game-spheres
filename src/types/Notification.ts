import { Timestamp } from "firebase-admin/firestore";

export type Notification = {
    type: "like" | "comment" | "follow" | "message"; // self explanatory
    fromUid: string; // id of person who triggered notification
    // following are related to notification type
    postId?: string; 
    commentId?: string;
    conversationId?: string;
    messageId?: string;
    ////
    createdAt: number | Timestamp; 
    read: boolean;
}