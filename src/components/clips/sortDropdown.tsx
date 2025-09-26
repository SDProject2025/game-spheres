"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Flame, Clock, TrendingUp } from "lucide-react";

export type SortOption =
  | "popular24h"
  | "popularWeek"
  | "popularMonth"
  | "recent";

interface SortDropdownProps {
  currentSort: SortOption;
  onSortChange: (sortOption: SortOption) => void;
  className?: string;
}

interface SortConfig {
  value: SortOption;
  label: string;
  icon: React.ComponentType<any>;
  category: "popularity" | "time";
  description: string;
}

const sortOptions: SortConfig[] = [
  {
    value: "popular24h",
    label: "24 Hours",
    icon: Flame,
    category: "popularity",
    description: "Most liked in last 24 hours",
  },
  {
    value: "popularWeek",
    label: "7 Days",
    icon: TrendingUp,
    category: "popularity",
    description: "Most liked in last week",
  },
  {
    value: "popularMonth",
    label: "30 Days",
    icon: TrendingUp,
    category: "popularity",
    description: "Most liked in last month",
  },
  {
    value: "recent",
    label: "Recent",
    icon: Clock,
    category: "time",
    description: "Newest uploads first",
  },
];

export default function SortDropdown({
  currentSort,
  onSortChange,
  className = "",
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopularitySubmenu, setShowPopularitySubmenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentOption = sortOptions.find(
    (option) => option.value === currentSort
  );
  const popularityOptions = sortOptions.filter(
    (option) => option.category === "popularity"
  );
  const timeOptions = sortOptions.filter(
    (option) => option.category === "time"
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowPopularitySubmenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSortSelect = (sortOption: SortOption) => {
    onSortChange(sortOption);
    setIsOpen(false);
    setShowPopularitySubmenu(false);
  };

  const handlePopularityHover = (show: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (show) {
      setShowPopularitySubmenu(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setShowPopularitySubmenu(false);
      }, 150);
    }
  };

  const getCurrentLabel = () => {
    if (currentOption?.category === "popularity") {
      return `Popular • ${currentOption.label}`;
    }
    return currentOption?.label || "Sort By";
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-80 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
      >
        <div className="flex items-center space-x-2 truncate">
          {currentOption && (
            <currentOption.icon className="w-4 h-4 text-gray-400" />
          )}
          <span>{getCurrentLabel()}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-1 w-80 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-2">
            {/* Popularity Section */}
            <div
              className="relative"
              onMouseEnter={() => handlePopularityHover(true)}
              onMouseLeave={() => handlePopularityHover(false)}
            >
              <div className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-700">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-white font-medium">
                    Popularity
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 transform -rotate-90" />
              </div>

              {showPopularitySubmenu && (
                <div className="absolute left-full top-0 ml-1 w-72 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                  <div className="py-2">
                    {popularityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortSelect(option.value)}
                        className={`w-full px-3 py-2 flex items-center space-x-2 text-sm text-white hover:bg-gray-700 transition-colors duration-150 ${
                          currentSort === option.value ? "bg-gray-700" : ""
                        }`}
                      >
                        <option.icon
                          className={`w-4 h-4 ${
                            currentSort === option.value
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-gray-400">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Time Section */}
            <div className="border-t border-gray-700 my-1"></div>
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`w-full px-3 py-2 flex items-center space-x-2 text-sm text-white hover:bg-gray-700 transition-colors duration-150 ${
                  currentSort === option.value ? "bg-gray-700" : ""
                }`}
              >
                <option.icon
                  className={`w-4 h-4 ${
                    currentSort === option.value
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                />
                <div>
                  <div className="flex items-start">{option.label}</div>
                  <div className="text-xs text-gray-400">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
