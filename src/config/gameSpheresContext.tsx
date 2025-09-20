"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { FullGameSphere } from "@/types/GameSphere";
import { db } from "@/config/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

interface GameSpheresContextType {
  gameSpheres: FullGameSphere[];
  setGameSpheres: (gs: FullGameSphere[]) => void;
  refreshGameSpheres: () => Promise<void>;
}

const GameSpheresContext = createContext<GameSpheresContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "gameSpheresCache";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 3; // 3 day TTL

interface CachedData {
  timestamp: number;
  data: FullGameSphere[];
}

export const GameSpheresProvider = ({ children }: { children: ReactNode }) => {
  const [gameSpheres, setGameSpheres] = useState<FullGameSphere[]>([]);

  const fetchStaticGameSpheres = useCallback(async () => {
    try {
      const q = query(collection(db, "gamespheres"), orderBy("name"));
      const snapshot = await getDocs(q);

      const data: FullGameSphere[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FullGameSphere[];

      setGameSpheres(data);

      const cache: CachedData = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Error fetching GameSpheres:", error);
    }
  }, []);

  // Manual refresh function
  const refreshGameSpheres = useCallback(async () => {
    console.log("Clearing cache and refetching data...");
    await fetchStaticGameSpheres();
  }, [fetchStaticGameSpheres]);

  // Load cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        // Ensure backwards compatibility for users who already have cached data
        // The old cache did not have a timestamp

        if (Array.isArray(parsed)) {
          // Old system, set cache
          setGameSpheres(parsed);

          console.log("You are using the old cache system");
          console.log(parsed);
          // Migrate to new caching system
          const cache: CachedData = {
            timestamp: Date.now(),
            data: parsed,
          };
          console.log("You have now been migrated to the new system");
          //Update local storage cache with the new caching system
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
          console.log(cache);
        } else {
          const { timestamp, data } = parsed as CachedData;
          setGameSpheres(data);

          const isExpired = Date.now() - timestamp > CACHE_TTL;
          if (isExpired) fetchStaticGameSpheres();
        }
        return;
      } catch (error) {
        console.error("Failed to parse cached GameSpheres:", error);
      }
    }

    // No cache or parsing error - fetch data
    fetchStaticGameSpheres();
  }, [fetchStaticGameSpheres]);

  return (
    <GameSpheresContext.Provider
      value={{ gameSpheres, setGameSpheres, refreshGameSpheres }}
    >
      {children}
    </GameSpheresContext.Provider>
  );
};

export const useGameSpheresContext = () => {
  const context = useContext(GameSpheresContext);
  if (!context) {
    throw new Error(
      "useGameSpheresContext must be used inside a GameSpheresProvider"
    );
  }
  return context;
};
