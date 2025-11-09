import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { NominatimResult } from "@/types/map";

export function useMapMarkers(map: maplibregl.Map | null, selectedLocation: NominatimResult | null) {
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map || !selectedLocation) {
      // Remove marker if no selection
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const centerLon = parseFloat(selectedLocation.lon);
    const centerLat = parseFloat(selectedLocation.lat);

    if (markerRef.current) {
      markerRef.current.setLngLat([centerLon, centerLat]);
    } else {
      markerRef.current = new maplibregl.Marker({ color: "#d00" })
        .setLngLat([centerLon, centerLat])
        .addTo(map);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, selectedLocation]);

  return {
    marker: markerRef.current,
  };
}