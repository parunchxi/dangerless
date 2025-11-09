import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { MapCoordinate } from "@/types/map";

export function useUserLocation(
  map: maplibregl.Map | null,
  userLocation: MapCoordinate | null
) {
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map || !userLocation) {
      // Remove marker if no user location
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (elementRef.current) {
        elementRef.current = null;
      }
      return;
    }

    const [lon, lat] = userLocation;

    if (markerRef.current) {
      // Update existing marker position
      markerRef.current.setLngLat([lon, lat]);
    } else {
      // Create Apple Maps style user location marker
      const el = document.createElement("div");
      el.className = "user-location-marker";
      el.innerHTML = `
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.3);
            animation: pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #3b82f6;
            border: 3px solid white;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);
          "></div>
        </div>
      `;
      elementRef.current = el;

      markerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([lon, lat])
        .addTo(map);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (elementRef.current) {
        elementRef.current = null;
      }
    };
  }, [map, userLocation]);

  return {
    marker: markerRef.current,
  };
}
