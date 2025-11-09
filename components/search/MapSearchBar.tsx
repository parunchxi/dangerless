"use client";

import React, { useState } from "react";
import { useMapSearch, useMapSelection } from "@/lib/hooks";
import { SearchInput, SearchResultItem, ErrorDisplay } from "./ui";

interface MapSearchBarProps {
  className?: string;
}

export function MapSearchBar({ className = "" }: MapSearchBarProps) {
  const { query, loading, error, search, setQuery, clearResults } =
    useMapSearch();
  const { results, selectLocation, selectedIndex } = useMapSelection();
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    setShowResults(true);
    await search();
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
      setShowResults(false);
      clearResults();
    }
  };

  const handleSelectLocation = (index: number) => {
    selectLocation(index);
    setShowResults(false);
  };

  return (
    <div className={`w-full max-w-[280px] sm:max-w-[400px] ${className}`}>
      <div className="flex flex-col w-full">
        <SearchInput
          value={query}
          onChange={handleQueryChange}
          onSubmit={handleSearch}
          placeholder="Search for a location"
          loading={loading}
          disabled={loading}
        />

        {/* Results dropdown */}
        {showResults && (
          <div className="mt-2 rounded-xl overflow-hidden bg-background/95 backdrop-blur-xl shadow-lg border border-border/20">
            {error && (
              <div className="p-3">
                <ErrorDisplay
                  error={error}
                  onRetry={handleSearch}
                  onDismiss={() => setShowResults(false)}
                />
              </div>
            )}

            {results && results.length > 0 && (
              <div className="max-h-60 overflow-auto">
                {results.map((result, index) => (
                  <SearchResultItem
                    key={result.place_id ?? `${index}`}
                    displayName={result.display_name}
                    isSelected={selectedIndex === index}
                    onClick={() => handleSelectLocation(index)}
                  />
                ))}
              </div>
            )}

            {!loading && !error && results && results.length === 0 && (
              <div className="p-3 text-sm text-foreground/60 text-center">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
