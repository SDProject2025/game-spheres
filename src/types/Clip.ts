import * as admin from "firebase-admin";

export interface Clip {
  id: string;
  caption: string;
  gameSphereId: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileSize: number;
  likesCount: number;
  likesLast24h?: number;
  likesLastWeek?: number;
  likesLastMonth?: number;
  lastPopularityUpdate?: admin.firestore.Timestamp;

  muxAssetId: string;
  muxPlaybackId?: string;
  processingStatus: "uploading" | "preparing" | "ready" | "errored";
  thumbnailUrl?: string;
  duration?: number;
  aspectRatio?: string;
}

export enum ClipProcessingStatus {
  UPLOADING = "uploading",
  PREPARING = "preparing",
  READY = "ready",
  ERRORED = "errored",
}
