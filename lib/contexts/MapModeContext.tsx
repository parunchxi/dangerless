"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { MapMode } from "@/types/map";
import { MAP_MODES } from "@/lib/constants";

interface MapModeContextType {
  mode: MapMode;
  setMode: (mode: MapMode) => void;
  isSearchMode: boolean;
  isAddNewsMode: boolean;
  toggleAddNews: () => void;
}

const MapModeContext = createContext<MapModeContextType | undefined>(undefined);

export function useMapMode() {
  const context = useContext(MapModeContext);
  if (!context) {
    throw new Error("useMapMode must be used within MapModeProvider");
  }
  return context;
}

interface MapModeProviderProps {
  children: React.ReactNode;
  initialMode?: MapMode;
}

export function MapModeProvider({ 
  children, 
  initialMode = MAP_MODES.SEARCH 
}: MapModeProviderProps) {
  const [mode, setModeState] = useState<MapMode>(initialMode);

  const setMode = useCallback((newMode: MapMode) => {
    setModeState(newMode);
  }, []);

  const toggleAddNews = useCallback(() => {
    setModeState(prev => 
      prev === MAP_MODES.ADD_NEWS ? MAP_MODES.SEARCH : MAP_MODES.ADD_NEWS
    );
  }, []);

  const value: MapModeContextType = {
    mode,
    setMode,
    isSearchMode: mode === MAP_MODES.SEARCH,
    isAddNewsMode: mode === MAP_MODES.ADD_NEWS,
    toggleAddNews,
  };

  return (
    <MapModeContext.Provider value={value}>
      {children}
    </MapModeContext.Provider>
  );
}