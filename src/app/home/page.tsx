"use client";
import { auth } from "@/config/firebaseConfig";
import { useRouter } from "next/navigation";
import ClipGrid from "@/components/clips/ClipGrid";
import { useUser } from "@/config/userProvider";
import GameSphereFilter from "@/components/clips/gameSphereFilter";
import { useState } from "react";

export default function Home() {
  const [selectedGameSphere, setSelectedGameSphere] = useState("");
  const router = useRouter();
  const { user } = useUser();

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl text-center">GameSpheres</h1>
      <>
        {/* Left Side - Clear Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            {selectedGameSphere && (
              <button
                onClick={() => setSelectedGameSphere("")}
                className="text-sm text-blue-400 hover:text-blue-300"
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

        {/* Use ClipsGrid with filter options */}
        <ClipGrid
          userFilter={user?.uid}
          gameSphereFilter={selectedGameSphere}
          key={`${user?.uid}-${selectedGameSphere}`}
        />
      </>
    </div>
  );
}
