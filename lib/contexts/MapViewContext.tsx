"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { MapCoordinate, MapBounds, NominatimResult } from "@/types/map";
import { MAP_CONFIG } from "@/lib/constants";

interface MapViewState {
  center: MapCoordinate;
  zoom: number;
  bounds: MapBounds | null;
  selectedLocation: NominatimResult | null;
  userLocation: MapCoordinate | null;
}

interface MapViewContextType extends MapViewState {
  setCenter: (center: MapCoordinate) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: MapBounds | null) => void;
  setSelectedLocation: (location: NominatimResult | null) => void;
  setUserLocation: (location: MapCoordinate | null) => void;
  focusOnLocation: (location: NominatimResult) => void;
  resetView: () => void;
}

const MapViewContext = createContext<MapViewContextType | undefined>(undefined);

export function useMapView() {
  const context = useContext(MapViewContext);
  if (!context) {
    throw new Error("useMapView must be used within MapViewProvider");
  }
  return context;
}

interface MapViewProviderProps {
  children: React.ReactNode;
}

export function MapViewProvider({ children }: MapViewProviderProps) {
  const [state, setState] = useState<MapViewState>({
    center: MAP_CONFIG.DEFAULT_CENTER,
    zoom: MAP_CONFIG.DEFAULT_ZOOM,
    bounds: null,
    selectedLocation: null,
    userLocation: null,
  });

  // Get user's current location on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: MapCoordinate = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setState((prev) => ({
            ...prev,
            center: userLocation,
            zoom: MAP_CONFIG.SELECTED_ZOOM,
          }));
        },
        (error) => {
          console.warn("Failed to get user location:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  const setCenter = useCallback((center: MapCoordinate) => {
    setState((prev) => ({ ...prev, center }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom }));
  }, []);

  const setBounds = useCallback((bounds: MapBounds | null) => {
    setState((prev) => ({ ...prev, bounds }));
  }, []);

  const setSelectedLocation = useCallback(
    (selectedLocation: NominatimResult | null) => {
      setState((prev) => ({ ...prev, selectedLocation }));
    },
    []
  );

  const setUserLocation = useCallback((userLocation: MapCoordinate | null) => {
    setState((prev) => ({ ...prev, userLocation }));
  }, []);

  const focusOnLocation = useCallback((location: NominatimResult) => {
    const centerLon = parseFloat(location.lon);
    const centerLat = parseFloat(location.lat);
    const center: MapCoordinate = [centerLon, centerLat];

    let bounds: MapBounds | null = null;

    if (location.boundingbox && location.boundingbox.length === 4) {
      const bbox = location.boundingbox
        .map((s) => parseFloat(s))
        .filter((n): n is number => !isNaN(n));

      if (bbox.length === 4) {
        const [south, north, west, east] = bbox as [
          number,
          number,
          number,
          number
        ];
        bounds = [
          [west, south],
          [east, north],
        ];
      }
    }

    setState((prev) => ({
      ...prev,
      center,
      zoom: bounds ? prev.zoom : MAP_CONFIG.SELECTED_ZOOM,
      bounds,
      selectedLocation: location,
    }));
  }, []);

  const resetView = useCallback(() => {
    setState({
      center: MAP_CONFIG.DEFAULT_CENTER,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      bounds: null,
      selectedLocation: null,
      userLocation: null,
    });
  }, []);

  const value: MapViewContextType = {
    ...state,
    setCenter,
    setZoom,
    setBounds,
    setSelectedLocation,
    setUserLocation,
    focusOnLocation,
    resetView,
  };

  return (
    <MapViewContext.Provider value={value}>{children}</MapViewContext.Provider>
  );
}
