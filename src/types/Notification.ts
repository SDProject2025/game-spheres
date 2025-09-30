import type { Clip } from "./Clip";

export type Notification = {
    notificationId?: string;
    type: "like" | "comment" | "follow"; // self explanatory
    fromUid: string; // id of person who triggered notification
    toUid: string;
    // following are related to notification type
    postId?: string; 
    commentId?: string;
    commentContent?: string;
    clip?: Clip;
    ////
    createdAt?: number;
    read: boolean;
}