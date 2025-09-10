import { FullGameSphere } from "./GameSphere";

export interface Clip {
  id: string;
  caption: string;
  videoUrl: string;
  gameSphereId: string;
  gameSphere?: FullGameSphere;
  uploadedBy: string;
  uploadedAt: Date;
  fileSize: number;
  duration?: number;
}
