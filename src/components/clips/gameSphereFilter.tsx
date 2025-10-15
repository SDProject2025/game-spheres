"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { X, Search } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when mobile modal is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

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

  // Get the display text for selected GameSphere
  const selectedGameSphereName = useMemo(() => {
    if (!selectedGameSphere) return "";
    const gameSphere = gameSpheres.find((s) => s.id === selectedGameSphere);
    return gameSphere?.name || "";
  }, [selectedGameSphere, gameSpheres]);

  // Reset search query when selectedGameSphere is cleared externally (from clear filter button for example)
  useEffect(() => {
    if (!selectedGameSphere) {
      setSearchQuery("");
    }
  }, [selectedGameSphere]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isMobile &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

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

  const handleClose = () => {
    setIsOpen(false);
    // Reset search query when closing on mobile
    if (isMobile && !selectedGameSphereName) {
      setSearchQuery("");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search input for desktop */}
      {!isMobile && (
        <input
          ref={inputRef}
          type="text"
          placeholder="Search GameSpheres..."
          value={
            isOpen
              ? searchQuery
              : selectedGameSphereName || "Select a GameSphere..."
          }
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="block w-full md:w-80 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
        />
      )}

      {/* Search input for mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
        >
          <span
            className={selectedGameSphereName ? "text-white" : "text-gray-400"}
          >
            {selectedGameSphereName || "Select a GameSphere..."}
          </span>
          <Search className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* Mobile Modal Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
        />
      )}

      {/* Results dropdown */}
      {isOpen && (
        <div
          className={`
          ${
            isMobile
              ? "fixed inset-0 bg-gray-900 z-50 flex flex-col"
              : "absolute top-full left-0 right-0 z-10 bg-gray-800 border-l border-r border-b border-gray-700 rounded-b-md max-h-64 overflow-y-auto"
          }
        `}
        >
          {/* Mobile Header */}
          {isMobile && (
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Select GameSphere</h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search GameSpheres..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  autoFocus
                  className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results List */}
          <div
            className={`
            overflow-y-auto flex-1
            ${isMobile ? "bg-gray-900" : ""}
          `}
          >
            {/* Filtered options */}
            {filteredGameSpheres.map((gameSphere) => (
              <div
                key={gameSphere.id}
                onClick={() => handleOptionClick(gameSphere.id)}
                className={`
                  px-4 py-3 cursor-pointer text-sm text-white transition-colors
                  ${
                    isMobile
                      ? "hover:bg-gray-800 active:bg-gray-700"
                      : "hover:bg-gray-700"
                  }
                  ${
                    selectedGameSphere === gameSphere.id
                      ? isMobile
                        ? "bg-gray-800"
                        : "bg-gray-700"
                      : ""
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{gameSphere.name}</span>
                  {isMobile && selectedGameSphere === gameSphere.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))}

            {/* No results message */}
            {searchQuery.trim() && filteredGameSpheres.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No GameSpheres found for &quot;{searchQuery}&quot;
              </div>
            )}

            {/* Empty state when no search query */}
            {!searchQuery.trim() && gameSpheres.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No GameSpheres available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
