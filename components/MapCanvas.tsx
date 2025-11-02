"use client";

import { useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import {
  useMapInstance,
  useMapMarkers,
  useMapHighlights,
  useMapControls,
  useUserLocation,
} from "@/lib/hooks";
import { MapControls, LayerSelector } from "@/components/controls";
import { useMapView } from "@/lib/contexts";

interface MapCanvasProps {
  hideMobileControls?: boolean;
}

export function MapCanvas({ hideMobileControls = false }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, isReady } = useMapInstance(containerRef);
  const { selectedLocation, userLocation } = useMapView();
  const {
    handleZoomIn,
    handleZoomOut,
    handleResetNorth,
    handleGeolocate,
    isGeolocating,
  } = useMapControls(map);

  useMapMarkers(map, selectedLocation || null);
  useMapHighlights(map, selectedLocation || null);
  useUserLocation(map, userLocation);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        role="application"
        aria-label="Interactive map"
      />

      {isReady && (
        <div
          className={cn(
            "absolute top-4 right-4 z-[1000] pointer-events-auto flex flex-col gap-2 transition-opacity duration-300",
            hideMobileControls ? "opacity-0 lg:opacity-100" : "opacity-100"
          )}
        >
          <LayerSelector />
          <MapControls
            map={map}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetNorth={handleResetNorth}
            onGeolocate={handleGeolocate}
            isGeolocating={isGeolocating}
          />
        </div>
      )}
    </div>
  );
}
