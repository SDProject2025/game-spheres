"use client";
import ClipGrid from "@/components/clips/ClipGrid";
import SortDropdown, { SortOption } from "@/components/clips/sortDropdown";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGameSpheresContext } from "@/config/gameSpheresContext";

export default function GameSpherePage() {
  const [sortBy, setSortBy] = useState<SortOption>("popular24h");
  const { gameSpheres } = useGameSpheresContext();

  console.log("----------------------");
  console.log("LOADING SPECIFIC GS CLIPS");
  console.log("----------------------");

  const params = useParams();
  const gameSphereId = params.id as string;
  const gameSphere = gameSpheres.find((gs) => gs.id === gameSphereId);
  const gameSphereName = gameSphere?.name || "GameSpheres";

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const clipGridKey = useMemo(
    () => `gs-${gameSphereId}-${sortBy}`,
    [gameSphereId, sortBy]
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center">
      <div className="w-full flex justify-begin">
        <h1 className="text-3xl sm:text-4xl mb-6">{gameSphereName}</h1>
      </div>

      {/* Sort Controls */}
      <div className="w-full mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        {/* Left: Sort Dropdown */}
        <div className="flex items-center space-x-4">
          <SortDropdown currentSort={sortBy} onSortChange={handleSortChange} />
        </div>
      </div>

      {/* Clips Grid */}
      <div className="w-full">
        <ClipGrid
          gameSphereFilter={gameSphereId}
          sortBy={sortBy}
          key={clipGridKey}
        />
      </div>
    </div>
  );
}
