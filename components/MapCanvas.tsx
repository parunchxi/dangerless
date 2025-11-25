"use client";

import { useRef, useEffect } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import {
  useMapInstance,
  useMapMarkers,
  useMapHighlights,
  useMapControls,
  useUserLocation,
  useMapSelection,
} from "@/lib/hooks";
import { MapControls, LayerSelector } from "@/components/controls";
import { useMapView, useAreaStatus } from "@/lib/contexts";

interface MapCanvasProps {
  hideMobileControls?: boolean;
  areaStatus?: string;
}

export function MapCanvas({
  hideMobileControls = false,
  areaStatus,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { map, isReady } = useMapInstance(containerRef);
  const { selectedLocation, userLocation } = useMapView();
  const { areaStatus: contextAreaStatus } = useAreaStatus();
  const {
    handleZoomIn,
    handleZoomOut,
    handleResetNorth,
    handleGeolocate,
    isGeolocating,
  } = useMapControls(map);

  // Use context area status if not provided via props
  const effectiveAreaStatus = areaStatus || contextAreaStatus;

  useMapMarkers(map, selectedLocation || null);
  useMapHighlights(map, selectedLocation || null, effectiveAreaStatus);
  useUserLocation(map, userLocation);

  const { handleLocationClick } = useMapSelection();

  // Handle click events for location selection
  useEffect(() => {
    if (!map) return;

    const handleClick = (
      e: maplibregl.MapMouseEvent & { lngLat: maplibregl.LngLat }
    ) => {
      handleLocationClick(map, e.lngLat);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, handleLocationClick]);

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
