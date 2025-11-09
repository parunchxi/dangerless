"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { SearchState, MapError, NominatimResult } from "@/types/map";
import { geocodingService } from "@/lib/services/geocoding";

interface MapDataContextType extends SearchState {
  setQuery: (query: string) => void;
  setResults: (results: NominatimResult[] | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: MapError | null) => void;
  setSelectedIndex: (index: number | null) => void;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

const MapDataContext = createContext<MapDataContextType | undefined>(undefined);

export function useMapData() {
  const context = useContext(MapDataContext);
  if (!context) {
    throw new Error("useMapData must be used within MapDataProvider");
  }
  return context;
}

interface MapDataProviderProps {
  children: React.ReactNode;
}

export function MapDataProvider({ children }: MapDataProviderProps) {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: null,
    loading: false,
    error: null,
    selectedIndex: null,
  });

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  const setResults = useCallback((results: NominatimResult[] | null) => {
    setState((prev) => ({ ...prev, results }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: MapError | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setSelectedIndex = useCallback((selectedIndex: number | null) => {
    setState((prev) => ({ ...prev, selectedIndex }));
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      results: null,
      selectedIndex: null,
    }));

    try {
      const results = await geocodingService.geocode(query);
      setState((prev) => ({
        ...prev,
        loading: false,
        results,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as MapError,
      }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      results: null,
      selectedIndex: null,
      error: null,
    }));
  }, []);

  const value: MapDataContextType = {
    ...state,
    setQuery,
    setResults,
    setLoading,
    setError,
    setSelectedIndex,
    search,
    clearResults,
  };

  return (
    <MapDataContext.Provider value={value}>{children}</MapDataContext.Provider>
  );
}
