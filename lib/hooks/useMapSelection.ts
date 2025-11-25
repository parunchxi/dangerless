import { useCallback, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { useMapData, useMapView, useMapMode } from "../contexts";
import type { MapCoordinate } from "@/types/map";
import { MAP_MODES, API_CONFIG } from "../constants";

import { useLocationSelection } from "../contexts/LocationSelectionContext";

export function useMapSelection() {
  const { results, selectedIndex, setSelectedIndex } = useMapData();
  const { focusOnLocation } = useMapView();
  const { mode, setMode } = useMapMode();

  const selectLocation = useCallback(
    (index: number) => {
      if (!results || index < 0 || index >= results.length) return;

      const location = results[index];
      if (!location) return;

      setSelectedIndex(index);
      focusOnLocation(location);
      setMode(MAP_MODES.SCOUTING);
    },
    [results, setSelectedIndex, focusOnLocation, setMode]
  );

  const clearSelection = useCallback(() => {
    setSelectedIndex(null);
  }, [setSelectedIndex]);

  const { setSelectedLocation, setCoordinates } = useLocationSelection();

  const reverseGeocode = useCallback(
    async ([lng, lat]: MapCoordinate) => {
      try {
        // Using our API endpoint for reverse geocoding
        const url = `/api/map?lat=${lat}&lon=${lng}`;
        const response = await fetch(url);
        // console.log("Reverse geocoding request sent to:", url);

        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }

        const data = await response.json();
        // console.log("Geocoding response:", data);
        // console.log("Setting location with:", data.display_name, lat, lng);
        setSelectedLocation(data.display_name);
        setCoordinates({ lat, lng });
        setMode(MAP_MODES.SEARCH); // Reset mode after successful geocoding
      } catch (error) {
        // console.error("Error reverse geocoding:", error);
        setMode(MAP_MODES.SEARCH); // Reset mode even if there's an error
      }
    },
    [setSelectedLocation, setCoordinates, setMode]
  );

  const handleLocationClick = useCallback(
    (map: maplibregl.Map, lngLat: maplibregl.LngLat) => {
      if (mode !== MAP_MODES.SELECT_LOCATION) return;

      const coordinate: MapCoordinate = [lngLat.lng, lngLat.lat];

      // Remove existing selection marker if any
      if (map.getLayer("location-selection-marker-pulse")) {
        map.removeLayer("location-selection-marker-pulse");
      }
      if (map.getLayer("location-selection-marker")) {
        map.removeLayer("location-selection-marker");
      }
      if (map.getSource("location-selection-marker")) {
        map.removeSource("location-selection-marker");
      }

      // Size you can change quickly
      const MARKER_RADIUS = 7; // <- change this to resize the marker (px)

      // Add new marker source (give it a 'pulse' property if you plan to animate)
      map.addSource("location-selection-marker", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "Point", coordinates: coordinate },
          properties: { pulse: 0 }, // keep pulse defined so expressions won't fail
        },
      });

      // Simple (static) circle layer for visible marker
      map.addLayer({
        id: "location-selection-marker",
        type: "circle",
        source: "location-selection-marker",
        paint: {
          // static radius (easy to change)
          "circle-radius": MARKER_RADIUS,

          // fill and outline
          "circle-color": "#F32013",
          "circle-opacity": 0.95,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // Optional: Add a secondary larger faded circle to mimic a pulse ring
      map.addLayer({
        id: "location-selection-marker-pulse",
        type: "circle",
        source: "location-selection-marker",
        paint: {
          // slightly larger ring
          "circle-radius": MARKER_RADIUS * 1.6,
          "circle-color": "#F32013",
          "circle-opacity": 0.25,
        },
      });

      // If you want a simple pulse animation (grow/shrink), update the source properties
      // We'll toggle the 'pulse' property and recompute the source - simple and lightweight.
      // You can remove this block if you don't want animation.
      let pulseState = 0;
      let pulseInterval = window.setInterval(() => {
        pulseState = 1 - pulseState; // toggle 0 <-> 1
        const src = map.getSource("location-selection-marker") as
          | maplibregl.GeoJSONSource
          | undefined;
        if (!src) {
          clearInterval(pulseInterval);
          return;
        }
        // update properties so expressions (if used) can reference 'pulse'
        const newGeojson = {
          type: "Feature",
          geometry: { type: "Point", coordinates: coordinate },
          properties: { pulse: pulseState },
        };
        try {
          // setData exists on GeoJSON source
          (src as any).setData(newGeojson);
        } catch (e) {
          // if the source becomes unavailable, stop the interval
          clearInterval(pulseInterval);
        }
      }, 700);

      // Stop animation after a few cycles (cleaner). Adjust time if you want it longer.
      window.setTimeout(() => clearInterval(pulseInterval), 4000);

      reverseGeocode(coordinate);
    },
    [mode, reverseGeocode]
  );


  const selectedLocation =
    results && selectedIndex !== null ? results[selectedIndex] : null;

  return {
    results,
    selectedIndex,
    selectedLocation,
    selectLocation,
    clearSelection,
    handleLocationClick,
    hasResults: Boolean(results && results.length > 0),
    hasSelection: selectedIndex !== null,
  };
}