"use client";

import { useRouter } from "next/navigation";
import ClipGrid from "@/components/clips/ClipGrid";
import { useUser } from "@/config/userProvider";
import GameSphereFilter from "@/components/clips/gameSphereFilter";
import SortDropdown, { SortOption } from "@/components/clips/sortDropdown";
import { useState, useMemo } from "react";

export default function Home() {
  const [selectedGameSphere, setSelectedGameSphere] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("popular24h");
  const { user } = useUser();

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const clipGridKey = useMemo(
    () => `${user?.uid || "guest"}-${selectedGameSphere}-${sortBy}`,
    [user?.uid, selectedGameSphere, sortBy]
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center">
      <div className="w-full flex justify-begin">
        <h1 className="text-3xl sm:text-4xl mb-6">GameSpheres</h1>
      </div>

      {/* Filter and Sort Controls */}
      <div className="w-full mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        
        {/* Left: Sort Dropdown */}
        <div className="flex items-center space-x-4">
          <SortDropdown currentSort={sortBy} onSortChange={handleSortChange} />
        </div>

        {/* Right: GameSphere Filter */}
        <div className="flex flex-col items-end">
          <GameSphereFilter
            selectedGameSphere={selectedGameSphere}
            onGameSphereChange={setSelectedGameSphere}
            className="w-full sm:w-auto"
          />
          {selectedGameSphere && (
            <button
              onClick={() => setSelectedGameSphere("")}
              className="mt-1 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Clips Grid */}
      <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center">
        <ClipGrid
          userFilter={user?.uid}
          gameSphereFilter={selectedGameSphere}
          sortBy={sortBy}
          key={clipGridKey}
        />
      </div>
    </div>
  );
}
