export interface Clip {
  id: string;
  caption: string;
  gameSphereId: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileSize: number;

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
