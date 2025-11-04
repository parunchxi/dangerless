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
      // console.log("Map clicked at coordinates:", coordinate);

      // Remove existing selection marker if any
      const existingMarker = map.getLayer("location-selection-marker");
      if (existingMarker) {
        map.removeLayer("location-selection-marker");
        map.removeSource("location-selection-marker");
      }

      // Add new marker
      map.addSource("location-selection-marker", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coordinate,
          },
          properties: {},
        },
      });

      map.addLayer({
        id: "location-selection-marker",
        type: "circle",
        source: "location-selection-marker",
        paint: {
          "circle-radius": 8,
          "circle-color": "#3b82f6", // primary color
          "circle-opacity": 0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

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
