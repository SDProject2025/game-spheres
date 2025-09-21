"use client";
import { useGameSpheresContext } from "@/config/gameSpheresContext";

interface GameSphereFilterProps {
  selectedGameSphere: string;
  onGameSphereChange: (gameSphereId: string) => void;
  className?: string;
}

export default function GameSphereFilter({
  selectedGameSphere,
  onGameSphereChange,
  className = "",
}: GameSphereFilterProps) {
  const { gameSpheres } = useGameSpheresContext();

  return (
    <div className={className}>
      <select
        value={selectedGameSphere}
        onChange={(e) => onGameSphereChange(e.target.value)}
        className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-blue-500 focus:border-blue-500 text-sm "
      >
        <option value="">All Games</option>
        {gameSpheres.map((sphere) => (
          <option key={sphere.id} value={sphere.id}>
            {sphere.name}
          </option>
        ))}
      </select>
    </div>
  );
}
