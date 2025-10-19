import { SearchItem } from "@/components/search/searchBar";
import { Timestamp } from "firebase-admin/firestore";

type FirestoreReference = {
  type: string;
  referencePath: string;
};

export interface GameSphere extends SearchItem {
  name: string;
  storyline?: string;
  genres?: string[];
  releaseDate?: string;
  platforms?: string[];
  publishers?: string[];
  developers?: string[];
  coverUrl?: string;
  subscribers?: (string | FirestoreReference)[];
  createdAt: Timestamp | null;
}

export interface FullGameSphere extends GameSphere {
  id: string;
}
