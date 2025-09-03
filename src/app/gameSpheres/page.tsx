"use client";
import Fuse from "fuse.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/config/userProvider";
import { FullGameSphere } from "@/types/GameSphere";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

import SearchBar from "@/components/search/searchBar";
import { useGameSpheresContext } from "@/config/gameSpheresContext";
import { authFetch } from "@/config/authorisation";

const fuseOptions = { keys: ["name"], threshold: 0.3 }; //0.0 - exact match required

export default function GameSpheres() {
  const { gameSpheres } = useGameSpheresContext();
  const [selectedGame, setSelectedGame] = useState<FullGameSphere | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false); // use for dynamic button text

  const router = useRouter();
  const { user, loading } = useUser();

  const fuseRef = useRef<Fuse<FullGameSphere> | null>(null);

  // Update Fuse instance when gameSpheres changes
  useEffect(() => {
    if (gameSpheres.length > 0) {
      fuseRef.current = new Fuse(gameSpheres, fuseOptions);
    }
  }, [gameSpheres]);

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [router]);

  // check sub status
  useEffect(() => {
    const checkSub = async () => {
      if (!user || !selectedGame) return;

      try {
        const res = await fetch(
          `/api/gameSpheres/subscriptions?userId=${user.uid}&gameSphereId=${selectedGame.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setIsSubscribed(data.isSubscribed);
        }
      } catch (error) {
        console.error("Error Checking Subscription:", error);
      }
    };
    checkSub();
  }, [selectedGame, user]);

  // Search using Fuse - memoized to prevent re-renders
  const searchGameSpheres = useCallback(async (query: string) => {
    if (!fuseRef.current) return [];
    if (!query) return [];
    const results = fuseRef.current.search(query).map((r) => r.item);
    // console.log("Search Results:", results);
    return results;
  }, []);

  // subscribe / unsubscribe - memoized to prevent re-renders
  const handleSubButtonClicked = useCallback(
    async (gameSphere: FullGameSphere) => {
      if (!user) {
        router.replace("/");
        return;
      }

      try {
        const action = isSubscribed ? "unsubscribe" : "subscribe";

        const res = await authFetch("/api/gameSpheres/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameSphereId: gameSphere.id,
            action,
          }),
        });

        if (!res.ok) {
          throw new Error("Error updating subscription");
        }

        const data = await res.json();

        const toastMessage =
          action === "subscribe"
            ? `Subscribed to GameSphere: ${gameSphere.name}`
            : `Unsubscribed from GameSphere: ${gameSphere.name}`;

        setIsSubscribed(data.isSubscribed);

        toast.success(toastMessage);
      } catch (error) {
        console.error("Error updating subscription:", error);
        toast.error("Something went wrong :(");
      }
    },
    [user, router, isSubscribed]
  );

  // Render item for GameSphere items in the list returned after searching - memoized
  const renderGameItem = useCallback(
    (game: FullGameSphere, isSelected: boolean) => (
      <div className="flex items-center space-x-3">
        <img
          src={game.coverUrl}
          alt={game.name}
          className="w-12 h-12 object-cover rounded"
        />
        <span>{game.name}</span>
      </div>
    ),
    []
  );

  // Render details for game selected from search list - memoized
  const renderGameDetails = useCallback(
    (game: FullGameSphere) => (
      <>
        <div className="flex items-center mb-6">
          <img
            src={game.coverUrl}
            alt={game.name}
            className="w-20 h-20 rounded-full object-cover mr-5 flex-shrink-0"
          />
          <h2 className="text-3xl font-semibold text-cyan-300">{game.name}</h2>
        </div>

        {game.releaseDate && (
          <p className="text-gray-400 mb-2">
            <strong>Released:</strong> {game.releaseDate}
          </p>
        )}

        {game.storyline && (
          <p className="text-gray-300 mb-4">{game.storyline}</p>
        )}

        {game.genres && game.genres.length > 0 && (
          <p className="mb-4">
            <strong>Genres:</strong> {game.genres.join(", ")}
          </p>
        )}
      </>
    ),
    []
  );

  // Memoized action button text function
  const actionButtonText = useCallback(
    (game: FullGameSphere) => (isSubscribed ? "Unsubscribe" : "Subscribe"),
    [isSubscribed]
  );

  // function to update which game is selected based on search list
  const handleSelection = useCallback((game: FullGameSphere | null) => {
    // console.log("Changing selected Game to:", game?.name || null);
    setSelectedGame(game);
  }, []);

  return (
    <>
      {/* Match Props from searchBar.tsx */}
      <SearchBar
        placeholder="Search for a game ..."
        title="Search GameSpheres"
        searchFunction={searchGameSpheres}
        renderItem={renderGameItem}
        renderDetails={renderGameDetails}
        onItemAction={handleSubButtonClicked}
        actionButtonText={actionButtonText}
        onSelectionChange={handleSelection}
      />
      <Toaster />
    </>
  );
}
