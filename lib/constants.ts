export const MAP_MODES = {
  SEARCH: "search",
  SCOUTING: "scouting",
  NEWS: "news",
  HISTORY: "history",
  ADD_NEWS: "addnew",
  SELECT_LOCATION: "select-location",
} as const;

export const DETAIL_BAR_CONFIG = {
  MOBILE: {
    COLLAPSED_HEIGHT: 0,
    PARTIAL_HEIGHT: 300,
    FULL_HEIGHT: 500,
  },
  DESKTOP: {
    COLLAPSED_WIDTH: 0,
    EXPANDED_WIDTH: 400,
  },
} as const;

export const MAP_CONFIG = {
  DEFAULT_CENTER: [0, 0] as [number, number],
  DEFAULT_ZOOM: 4,
  SELECTED_ZOOM: 14,
  ANIMATION_DURATION: 1500,
  ZOOM_ANIMATION_DURATION: 2000,
  SEARCH_LIMIT: 5,
} as const;

export const API_CONFIG = {
  GEOCODING_ENDPOINT: "/api/map",
  NOMINATIM_BASE_URL: "https://nominatim.openstreetmap.org",
} as const;

export const MAP_LAYERS = {
  STANDARD: "standard",
  HYBRID: "hybrid",
  SATELLITE: "satellite",
} as const;

export const MAP_LAYER_STYLES = {
  [MAP_LAYERS.STANDARD]: {
    light: {
      version: 8 as const,
      sources: {
        "osm-tiles": {
          type: "raster" as const,
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "osm-tiles",
          type: "raster" as const,
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "dark-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "dark-tiles",
          type: "raster" as const,
          source: "dark-tiles",
          minzoom: 0,
          maxzoom: 16,
        },
      ],
    },
  },
  [MAP_LAYERS.SATELLITE]: {
    light: {
      version: 8 as const,
      sources: {
        "satellite-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "satellite-tiles",
          type: "raster" as const,
          source: "satellite-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "satellite-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "satellite-tiles",
          type: "raster" as const,
          source: "satellite-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
  [MAP_LAYERS.HYBRID]: {
    light: {
      version: 8 as const,
      sources: {
        "satellite-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
        "labels-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "satellite-tiles",
          type: "raster" as const,
          source: "satellite-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
        {
          id: "labels-tiles",
          type: "raster" as const,
          source: "labels-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    dark: {
      version: 8 as const,
      sources: {
        "satellite-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
        "labels-tiles": {
          type: "raster" as const,
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "satellite-tiles",
          type: "raster" as const,
          source: "satellite-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
        {
          id: "labels-tiles",
          type: "raster" as const,
          source: "labels-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
};

export const MAP_LAYER_INFO = {
  [MAP_LAYERS.STANDARD]: {
    name: "Standard",
    description: "Classic street map",
  },
  [MAP_LAYERS.HYBRID]: {
    name: "Hybrid",
    description: "Satellite with labels",
  },
  [MAP_LAYERS.SATELLITE]: {
    name: "Satellite",
    description: "Aerial imagery",
  },
} as const;
