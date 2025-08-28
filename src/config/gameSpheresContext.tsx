"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  Children,
} from "react";
import { FullGameSphere } from "@/types/GameSphere";

interface GameSpheresContextType {
  gameSpheres: FullGameSphere[];
  setGameSpheres: (gs: FullGameSphere[]) => void;
}

const GameSpheresContext = createContext<GameSpheresContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "gameSpheresCache";

export const GameSpheresProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [gameSpheres, setGameSpheres] = useState<FullGameSphere[]>([]);

  useEffect(() => {
    const cachedGameSpheres = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (cachedGameSpheres) {
      console.log("GameSpheres found in cache");
      try {
        const parsedGameSpheres: FullGameSphere[] =
          JSON.parse(cachedGameSpheres);
        setGameSpheres(parsedGameSpheres);
        return;
      } catch (error) {
        console.error("Failed to fetch cached GameSpheres:", error);
      }
    }

    console.log("No GameSpheres in cache: fetching from API");

    // Fetch from backend API
    fetch("/api/gameSpheres/search")
      .then((res) => res.json())
      .then((data) => {
        setGameSpheres(data.gameSpheres);
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(data.gameSpheres)
        );
      })
      .catch((error) => console.log("Error fetching GameSpheres:", error));
  }, []);

  return (
    <GameSpheresContext.Provider value={{ gameSpheres, setGameSpheres }}>
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
