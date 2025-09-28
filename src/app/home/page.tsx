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
    <div className="w-full max-w-6xl mx-auto py-2 ml-50">
      <h1 className="text-4xl mb-4">GameSpheres</h1>
      <>
        {/* Filter and sort controls */}
        <div className="mt-3 mb-5 flex justify-between items-start">
          {/* Left side - Sort Dropdown */}
          <div className="flex flex-col">
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
