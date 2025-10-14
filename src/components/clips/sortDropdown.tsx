"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Flame, Clock, TrendingUp, X } from "lucide-react";

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
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
  const [isMobile, setIsMobile] = useState(false);
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

    if (!isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isMobile]);

  const handleSortSelect = (sortOption: SortOption) => {
    onSortChange(sortOption);
    setIsOpen(false);
    setShowPopularitySubmenu(false);
  };

  const handlePopularityHover = (show: boolean) => {
    if (isMobile) return; // Disable hover on mobile

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

  const handlePopularityClick = () => {
    if (isMobile) {
      setShowPopularitySubmenu(!showPopularitySubmenu);
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
        className="flex items-center justify-between w-full md:w-80 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 cursor-pointer"
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

      {/* Mobile Modal Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setIsOpen(false);
            setShowPopularitySubmenu(false);
          }}
        />
      )}

      {/* Dropdown Menu - Desktop & Mobile */}
      {isOpen && (
        <div
          className={`
          ${
            isMobile
              ? "fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-2xl z-50 max-h-[70vh] overflow-y-auto"
              : "absolute mt-1 w-80 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50"
          }
        `}
        >
          {/* Mobile Header */}
          {isMobile && (
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-semibold">Sort By</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowPopularitySubmenu(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="py-2">
            {/* Popularity Section */}
            <div
              className="relative"
              onMouseEnter={() => handlePopularityHover(true)}
              onMouseLeave={() => handlePopularityHover(false)}
            >
              <div
                className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-700"
                onClick={handlePopularityClick}
              >
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-white font-medium">
                    Popularity
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isMobile
                      ? showPopularitySubmenu
                        ? "rotate-180"
                        : ""
                      : "transform -rotate-90"
                  }`}
                />
              </div>

              {/* Desktop Submenu (flyout) */}
              {!isMobile && showPopularitySubmenu && (
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
                        <div className="text-left">
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

              {/* Mobile Submenu (accordion) */}
              {isMobile && showPopularitySubmenu && (
                <div className="bg-gray-900">
                  {popularityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortSelect(option.value)}
                      className={`w-full px-6 py-3 flex items-center space-x-3 text-sm text-white hover:bg-gray-700 transition-colors duration-150 ${
                        currentSort === option.value ? "bg-gray-700" : ""
                      }`}
                    >
                      <option.icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          currentSort === option.value
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                      />
                      <div className="text-left flex-1">
                        <div>{option.label}</div>
                        <div className="text-xs text-gray-400">
                          {option.description}
                        </div>
                      </div>
                      {currentSort === option.value && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </button>
                  ))}
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
                  className={`w-4 h-4 flex-shrink-0 ${
                    currentSort === option.value
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                />
                <div className="text-left flex-1">
                  <div>{option.label}</div>
                  <div className="text-xs text-gray-400">
                    {option.description}
                  </div>
                </div>
                {isMobile && currentSort === option.value && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
