export interface MuxPlaybackId {
  id: string;
  policy: string;
}

export interface MuxAssetData {
  id: string;
  status?: string;
  playback_ids?: MuxPlaybackId[];
  duration?: number;
  aspect_ratio?: string;
  passthrough?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MuxWebhookEvent {
  type: string;
  data: MuxAssetData;
  created_at: string;
  id: string;
  object: string;
  environment: {
    id: string;
    name: string;
  };
}

export type MuxWebhookEventType =
  | "video.asset.ready"
  | "video.asset.errored"
  | "video.asset.created"
  | "video.asset.deleted"
  | "video.upload.asset_created"
  | "video.upload.cancelled"
  | "video.upload.created"
  | "video.upload.errored";
