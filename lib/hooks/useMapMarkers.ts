import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { NominatimResult } from "@/types/map";
import {
  useMarkerNew,
  type MarkerNewItem,
} from "@/lib/contexts/MarkerNewContext";

export function useMapMarkers(
  map: maplibregl.Map | null,
  selectedLocation: NominatimResult | null
) {
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const newMarkerRefs = useRef<Record<string, maplibregl.Marker>>({});

  const { items: markerNewItems } = useMarkerNew();

  // Single selected location marker
  useEffect(() => {
    if (!map || !selectedLocation) {
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

  // markerNew items (multiple markers)
  useEffect(() => {
    if (!map) return;

    const existingIds = new Set(Object.keys(newMarkerRefs.current));

    markerNewItems.forEach((item: MarkerNewItem) => {
      if (!item.location) {
        // remove existing marker if present
        if (newMarkerRefs.current[item.id]) {
          newMarkerRefs.current[item.id]!.remove();
          delete newMarkerRefs.current[item.id];
        }
        return;
      }

      const lng = item.location.lon;
      const lat = item.location.lat;

      if (newMarkerRefs.current[item.id]) {
        newMarkerRefs.current[item.id]!.setLngLat([lng, lat]);
      } else {
        const color =
          item.severity === "danger"
            ? "#e11d48"
            : item.severity === "warning"
            ? "#f59e0b"
            : "#06b6d4";
        const marker = new maplibregl.Marker({ color })
          .setLngLat([lng, lat])
          .addTo(map);

        if (item.title) {
          const popup = new maplibregl.Popup({ offset: 12 }).setHTML(
            `<strong>${escapeHtml(
              item.title
            )}</strong><div style="font-size:12px">${escapeHtml(
              item.location_name || ""
            )}</div>`
          );
          marker.setPopup(popup);
        }

        newMarkerRefs.current[item.id] = marker;
      }

      existingIds.delete(item.id);
    });

    // Remove markers that are no longer present in the items
    existingIds.forEach((id) => {
      if (newMarkerRefs.current[id]) {
        newMarkerRefs.current[id]!.remove();
        delete newMarkerRefs.current[id];
      }
    });

    return () => {
      // cleanup on unmount
      Object.keys(newMarkerRefs.current).forEach((id) => {
        try {
          if (newMarkerRefs.current[id]) newMarkerRefs.current[id]!.remove();
        } catch (e) {
          // ignore
        }
        delete newMarkerRefs.current[id];
      });
    };
  }, [map, markerNewItems]);

  return {
    marker: markerRef.current,
    newMarkers: newMarkerRefs.current,
  };
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
