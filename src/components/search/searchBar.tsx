"use client";

import { useState, useEffect, useCallback } from "react";

export interface SearchItem {
  id: string;
  uid: string;
  name: string;
  [key: string]: unknown; // allow for item to have additional properties
}

export interface SearchBarProps<T extends SearchItem> {
  placeholder: string;
  title: string; // Page name (e.g. Search GameSpheres)
  searchFunction: (query: string) => Promise<T[]>;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode; // search results that will go in the left pane
  renderDetails: (item: T) => React.ReactNode; // detailed info of selected result in right pane
  onItemAction?: (item: T) => void; // action button (for GameSpheres - subscribe | for users - view profile?)
  actionButtonText?: (item: T) => string;
  onSelectionChange?: (item: T | null) => void;
}

export default function SearchBar<T extends SearchItem>({
  placeholder,
  title,
  searchFunction,
  renderItem,
  renderDetails,
  onItemAction,
  actionButtonText,
  onSelectionChange,
}: SearchBarProps<T>) {
  const [search, setSearch] = useState("");
  const [debounce, setDebounce] = useState(search);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);

  // debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounce(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Search effect
  useEffect(() => {
    if (debounce.trim() === "") {
      setResults([]);
      setSelected(null);
      onSelectionChange?.(null);
      return;
    }

    let isCancelled = false;

    const doSearch = async () => {
      setLoading(true);

      try {
        const searchResults = await searchFunction(debounce.trim());

        if (!isCancelled) {
          setResults(searchResults);

          // Auto select first result from list
          if (searchResults.length > 0) {
            const firstResult = searchResults[0];
            setSelected(firstResult);
            onSelectionChange?.(firstResult);
          } else {
            setSelected(null);
            onSelectionChange?.(null);
          }
        }
      } catch (error) {
        console.error("Error While Searching:", error);
        if (!isCancelled) {
          setResults([]);
          setSelected(null);
          onSelectionChange?.(null);
        }
      }

      if (!isCancelled) setLoading(false);
    };

    doSearch();

    return () => {
      isCancelled = true;
    };
  }, [debounce]);

  // Memoized selection handler to prevent re-renders
  const updateSelection = useCallback(
    (item: T | null) => {
      setSelected(item);
      onSelectionChange?.(item);
    },
    [onSelectionChange]
  );

  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center">
      <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-2xl overflow-hidden shadow-lg bg-[#111] transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]">
        {/* Left pane */}
        <div className="w-full md:w-1/3 bg-[#111111] p-4 border-b md:border-b-0 md:border-r border-cyan-500 flex flex-col">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-cyan-400 text-center md:text-left">
            {title}
          </h2>

          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 px-3 py-2 rounded-lg border border-gray-600 bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          {loading && <p>Loading...</p>}

          {!loading && results.length === 0 && search.trim() !== "" && (
            <p className="text-center md:lext-left">No results found.</p>
          )}

          <div className="overflow-y-auto flex-1 max-h-[300px] md:max-h-[600px] scrollbar-thin pr-1">
            {results.map((item) => {
              const itemId = item.id || item.uid;
              const selectedId = selected?.id || selected?.uid;
              const isSelected = itemId === selectedId;
              return (
                <div
                  key={itemId}
                  className={`mb-2 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? "bg-cyan-600 text-black font-bold"
                      : "bg-[#222] hover:bg-[#333]"
                  }`}
                  onClick={() => {
                    updateSelection(item);
                  }}
                >
                  {renderItem(item, isSelected)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right detail pane */}
        <div className="w-full md:w-2/3 p-6 flex flex-col justify-center relative">
          {selected ? (
            <>
              {renderDetails(selected)}

              {onItemAction && actionButtonText && (
                <div className="mt-6 md:mt-auto flex justify-center">
                  <button
                    onClick={() => onItemAction(selected)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-full transition cursor-pointer"
                  >
                    {actionButtonText(selected)}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 self-center text-center">
              Search and select an item to see details here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
