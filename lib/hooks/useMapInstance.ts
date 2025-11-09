import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useTheme } from "next-themes";
import { useMapView, useMapLayer } from "../contexts";
import { MAP_CONFIG, MAP_LAYER_STYLES } from "../constants";

export function useMapInstance(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { center, zoom, bounds } = useMapView();
  const { layer } = useMapLayer();
  const { theme, resolvedTheme } = useTheme();
  const isInitialized = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Determine which style to use based on theme and layer
    const currentTheme = resolvedTheme || theme;
    const isDark = currentTheme === "dark";
    const mapStyle = MAP_LAYER_STYLES[layer]?.[isDark ? "dark" : "light"];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: center,
      zoom: zoom,
      attributionControl: false,
    });

    mapRef.current = map;

    // Mark as initialized after map loads
    map.once("load", () => {
      isInitialized.current = true;
      setIsLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      isInitialized.current = false;
      setIsLoaded(false);
    };
  }, [containerRef, center, zoom, theme, resolvedTheme, layer]);

  // Update map view when context changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isInitialized.current) return;

    if (bounds) {
      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: MAP_CONFIG.ANIMATION_DURATION,
      });
    } else {
      map.easeTo({
        center,
        zoom,
        duration: MAP_CONFIG.ANIMATION_DURATION,
      });
    }
  }, [center, zoom, bounds]);

  // Update map style when theme or layer changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isInitialized.current) return;

    const currentTheme = resolvedTheme || theme;
    const isDark = currentTheme === "dark";
    const newStyle = MAP_LAYER_STYLES[layer]?.[isDark ? "dark" : "light"];

    if (!newStyle) return;

    // Store current view before changing style
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    map.setStyle(newStyle);

    // Restore view after style loads
    map.once("style.load", () => {
      map.jumpTo({
        center: currentCenter,
        zoom: currentZoom,
      });
    });
  }, [theme, resolvedTheme, layer]);

  return {
    map: mapRef.current,
    isReady: isLoaded && Boolean(mapRef.current),
  };
}
