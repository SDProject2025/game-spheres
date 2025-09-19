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
  console.log(`User: ${user?.uid}`);
  return (
    <div className="w-full max-w-6xl mx-auto py-8 ml-50">
      <h1 className="text-4xl">GameSpheres</h1>
      <>
        {/* Filter Controls */}
        <div className="mb-6 flex justify-between items-center">
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
          <div className="max-w-xs">
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
