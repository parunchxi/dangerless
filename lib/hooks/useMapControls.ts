import { useCallback, useState } from "react";
import type maplibregl from "maplibre-gl";
import { useMapView } from "../contexts";

export function useMapControls(map: maplibregl.Map | null) {
  const { setCenter, setZoom, setUserLocation } = useMapView();
  const [isGeolocating, setIsGeolocating] = useState(false);

  const handleZoomIn = useCallback(() => {
    if (!map) {
      console.warn("Map not available for zoom in");
      return;
    }
    try {
      map.zoomIn({ duration: 300 });
    } catch (error) {
      console.error("Error zooming in:", error);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (!map) {
      console.warn("Map not available for zoom out");
      return;
    }
    try {
      map.zoomOut({ duration: 300 });
    } catch (error) {
      console.error("Error zooming out:", error);
    }
  }, [map]);

  const handleResetNorth = useCallback(() => {
    if (!map) {
      console.warn("Map not available for reset north");
      return;
    }
    try {
      map.easeTo({ bearing: 0, pitch: 0, duration: 500 });
    } catch (error) {
      console.error("Error resetting north:", error);
    }
  }, [map]);

  const handleGeolocate = useCallback(() => {
    if (!map) {
      console.warn("Map not available for geolocation");
      return;
    }
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      console.warn("Geolocation not available");
      return;
    }

    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        // Update context with user location
        setCenter(userLocation);
        setZoom(15);
        setUserLocation(userLocation);

        // Pan to user location
        try {
          map.easeTo({
            center: userLocation,
            zoom: 15,
            duration: 1000,
          });
        } catch (error) {
          console.error("Error panning to location:", error);
        }

        setIsGeolocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        setIsGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [map, setCenter, setZoom, setUserLocation]);

  return {
    handleZoomIn,
    handleZoomOut,
    handleResetNorth,
    handleGeolocate,
    isGeolocating,
  };
}
