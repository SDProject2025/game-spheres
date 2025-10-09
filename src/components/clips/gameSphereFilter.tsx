"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Configure Fuse.js for searching GameSphere
  const fuse = useMemo(() => {
    return new Fuse(gameSpheres, {
      keys: ["name"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [gameSpheres]);

  // Get filtered results based on search query
  const filteredGameSpheres = useMemo(() => {
    if (!searchQuery.trim()) {
      return gameSpheres;
    }

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [searchQuery, fuse, gameSpheres]);

  // Get the display text for selected GaemSphere
  const selectedGameSphereName = useMemo(() => {
    if (!selectedGameSphere) return "";
    const gameSphere = gameSpheres.find((s) => s.id === selectedGameSphere);
    return gameSphere?.name || "";
  }, [selectedGameSphere, gameSpheres]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (gameSphereId: string) => {
    onGameSphereChange(gameSphereId);
    const sphere = gameSpheres.find((s) => s.id === gameSphereId);
    setSearchQuery(sphere?.name || "");
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (selectedGameSphereName) {
      setSearchQuery(selectedGameSphereName);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search GameSpheres..."
        value={
          isOpen
            ? searchQuery
            : selectedGameSphereName || "Select a GameSphere..."
        }
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        className="block w-80 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
        readOnly={!isOpen}
      />

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-10 bg-gray-800 border-l border-r border-b border-gray-700 rounded-b-md max-h-64 overflow-y-auto">
          {/* Filtered options */}
          {filteredGameSpheres.map((gameSphere) => (
            <div
              key={gameSphere.id}
              onClick={() => handleOptionClick(gameSphere.id)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-700 text-sm text-white ${
                selectedGameSphere === gameSphere.id ? "bg-gray-700" : ""
              }`}
            >
              {gameSphere.name}
            </div>
          ))}

          {/* No results message */}
          {searchQuery.trim() && filteredGameSpheres.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">
              No GameSpheres found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
