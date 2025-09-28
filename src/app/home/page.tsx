"use client";
import { useRouter } from "next/navigation";
import ClipGrid from "@/components/clips/ClipGrid";
import { useUser } from "@/config/userProvider";
import GameSphereFilter from "@/components/clips/gameSphereFilter";
import SortDropdown, { SortOption } from "@/components/clips/sortDropdown";
import { useState } from "react";

export default function Home() {
  const [selectedGameSphere, setSelectedGameSphere] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular24h");
  const router = useRouter();
  const { user } = useUser();

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl text-center">GameSpheres</h1>
      <>
        {/* Filter and sort controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Left side - Sort Dropdown */}
          <div className="flex items-center space-x-4">
            <SortDropdown
              currentSort={sortBy}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Right side - GameSphere Filter */}
          <div className="flex flex-col items-end">
            <GameSphereFilter
              selectedGameSphere={selectedGameSphere}
              onGameSphereChange={setSelectedGameSphere}
              className="w-full"
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
          {/* Right Side - Dropdown */}
          <div className="w-full sm:w-auto max-w-xs">
            <GameSphereFilter
              selectedGameSphere={selectedGameSphere}
              onGameSphereChange={setSelectedGameSphere}
              className="w-full"
            />
          </div>
        </div>

        {/* Use ClipsGrid with filter and sorting options */}
        <ClipGrid
          userFilter={user?.uid}
          gameSphereFilter={selectedGameSphere}
          sortBy={sortBy}
          key={`${user?.uid}-${selectedGameSphere}-${sortBy}`}
        />
      </>
    </div>
  );
}
