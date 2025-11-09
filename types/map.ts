import { MAP_MODES, MAP_LAYERS } from "@/lib/constants";

export type NominatimResult = {
  place_id?: number | string;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: string[];
  class?: string;
  type?: string;
  geojson?: {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
  address?: {
    [key: string]: string;
  };
};

export type MapMode = (typeof MAP_MODES)[keyof typeof MAP_MODES];
// Backward compatibility
export type ModeKey = MapMode;

export type MapLayer = (typeof MAP_LAYERS)[keyof typeof MAP_LAYERS];

export type ModeMenu = {
  key: MapMode;
  label: string;
};

export type MapBounds = [[number, number], [number, number]];

export type MapCoordinate = [number, number];

export interface MapError {
  message: string;
  code?: string;
  type: "search" | "api" | "map" | "general";
}

export interface SearchState {
  query: string;
  results: NominatimResult[] | null;
  loading: boolean;
  error: MapError | null;
  selectedIndex: number | null;
}

export interface DetailBarState {
  viewState: 0 | 1 | 2;
  isExpanded: boolean;
}
