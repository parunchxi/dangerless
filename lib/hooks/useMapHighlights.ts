import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { NominatimResult } from "@/types/map";

export function useMapHighlights(
  map: maplibregl.Map | null,
  selectedLocation: NominatimResult | null
) {
  useEffect(() => {
    if (!map) return;

    // Clean up previous highlights
    const cleanupHighlights = () => {
      if (!map) return;

      try {
        if (map.getLayer("area-highlight")) {
          map.removeLayer("area-highlight");
        }
        if (map.getLayer("area-highlight-outline")) {
          map.removeLayer("area-highlight-outline");
        }
        if (map.getSource("area-highlight")) {
          map.removeSource("area-highlight");
        }
      } catch (error) {
        // Map might have been removed, ignore cleanup errors
        console.debug("Failed to cleanup highlights:", error);
      }
    };

    cleanupHighlights();

    if (!selectedLocation) return;

    const addHighlight = (geometry: GeoJSON.Geometry) => {
      if (!map) return;

      map.addSource("area-highlight", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry,
        },
      });

      map.addLayer({
        id: "area-highlight",
        type: "fill",
        source: "area-highlight",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.2,
        },
      });

      map.addLayer({
        id: "area-highlight-outline",
        type: "line",
        source: "area-highlight",
        paint: {
          "line-color": "#2563eb",
          "line-width": 2,
        },
      });
    };

    // Use geojson if available
    if (selectedLocation.geojson?.coordinates) {
      addHighlight(selectedLocation.geojson as GeoJSON.Geometry);
    }
    // Fall back to bounding box rectangle
    else if (
      selectedLocation.boundingbox &&
      selectedLocation.boundingbox.length === 4
    ) {
      const bbox = selectedLocation.boundingbox
        .map((s) => parseFloat(s))
        .filter((n): n is number => !isNaN(n));

      if (bbox.length === 4) {
        const [south, north, west, east] = bbox as [
          number,
          number,
          number,
          number
        ];

        const rectangleGeometry: GeoJSON.Geometry = {
          type: "Polygon",
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        };

        addHighlight(rectangleGeometry);
      }
    }

    return cleanupHighlights;
  }, [map, selectedLocation]);
}
