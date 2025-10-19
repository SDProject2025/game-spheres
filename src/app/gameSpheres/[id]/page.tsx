"use client";
import ClipGrid from "@/components/clips/ClipGrid";
import SortDropdown, { SortOption } from "@/components/clips/sortDropdown";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGameSpheresContext } from "@/config/gameSpheresContext";

export default function GameSpherePage() {
  const [sortBy, setSortBy] = useState<SortOption>("popular24h");
  const { gameSpheres } = useGameSpheresContext();

  const params = useParams();
  const gameSphereId = params.id as string;
  const gameSphere = gameSpheres.find((gs) => gs.id === gameSphereId);
  const gameSphereName = gameSphere?.name || "GameSpheres";
  const gameSphereDescription = gameSphere?.storyline;
  const subscriberCount = gameSphere?.subscribers?.length || 0;
  const coverPhotoUrl = gameSphere?.coverUrl;

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const clipGridKey = useMemo(
    () => `gs-${gameSphereId}-${sortBy}`,
    [gameSphereId, sortBy]
  );

  // Truncate description to 200 characters
  const truncatedDescription = gameSphereDescription
    ? gameSphereDescription.length > 400
      ? gameSphereDescription.substring(0, 400) + "..."
      : gameSphereDescription
    : null;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 flex flex-col">
      {/* Header Section */}
      <div className="w-full mb-4 sm:mb-6">
        <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3">
          {coverPhotoUrl && (
            <img
              src={coverPhotoUrl}
              alt={gameSphereName}
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 break-words">
              {gameSphereName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {subscriberCount.toLocaleString()}{" "}
              {subscriberCount === 1 ? "subscriber" : "subscribers"}
            </p>
          </div>
        </div>

        {truncatedDescription && (
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {truncatedDescription}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-200 mb-4 sm:mb-6"></div>

      {/* Sort Controls */}
      <div className="w-full mb-4 sm:mb-6">
        <div className="flex items-center">
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
