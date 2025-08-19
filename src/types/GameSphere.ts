import { Timestamp } from "firebase-admin/firestore";

export interface GameSphere {
  name: string;
  storyline?: string;
  genres?: string[];
  releaseDate?: string;
  platforms?: string[];
  publishers?: string[];
  developers?: string[];
  coverUrl?: string;
  subscribers?: string[];
  createdAt: Timestamp | null;
}

export interface FullGameSphere extends GameSphere {id: string};