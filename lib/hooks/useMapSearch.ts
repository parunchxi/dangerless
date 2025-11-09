import { useCallback } from "react";
import { useMapData, useMapMode } from "../contexts";
import { MAP_MODES } from "../constants";

export function useMapSearch() {
  const { query, loading, error, search, setQuery, clearResults } = useMapData();
  const { setMode } = useMapMode();

  const performSearch = useCallback(async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    setMode(MAP_MODES.SEARCH);
    await search(queryToSearch);
  }, [query, search, setMode]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
      clearResults();
    }
  }, [setQuery, clearResults]);

  return {
    query,
    loading,
    error,
    search: performSearch,
    setQuery: updateQuery,
    clearResults,
  };
}