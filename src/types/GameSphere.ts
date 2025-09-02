import { Timestamp } from "firebase-admin/firestore";
import { SearchItem } from "@/components/search/searchBar";

export interface FullGameSphere extends SearchItem {
  coverUrl: string;
  releaseDate?: string;
  storyline?: string;
  genres?: string[];
}