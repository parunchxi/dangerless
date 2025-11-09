"use client";

import React, { createContext, useContext, useState } from "react";
import type { MapLayer } from "@/types/map";
import { MAP_LAYERS } from "@/lib/constants";

interface MapLayerContextType {
  layer: MapLayer;
  setLayer: (layer: MapLayer) => void;
}

const MapLayerContext = createContext<MapLayerContextType | undefined>(
  undefined
);

export function useMapLayer() {
  const context = useContext(MapLayerContext);
  if (!context) {
    throw new Error("useMapLayer must be used within MapLayerProvider");
  }
  return context;
}

interface MapLayerProviderProps {
  children: React.ReactNode;
  initialLayer?: MapLayer;
}

export function MapLayerProvider({
  children,
  initialLayer = MAP_LAYERS.STANDARD,
}: MapLayerProviderProps) {
  const [layer, setLayer] = useState<MapLayer>(initialLayer);

  const value: MapLayerContextType = {
    layer,
    setLayer,
  };

  return (
    <MapLayerContext.Provider value={value}>
      {children}
    </MapLayerContext.Provider>
  );
}
