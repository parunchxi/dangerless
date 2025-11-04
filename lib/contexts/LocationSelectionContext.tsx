import { createContext, useContext, useState } from "react";

interface LocationSelectionContextType {
  selectedLocation: string;
  coordinates: { lat: number; lng: number } | null;
  setSelectedLocation: (address: string) => void;
  setCoordinates: (coords: { lat: number; lng: number } | null) => void;
}

const LocationSelectionContext = createContext<
  LocationSelectionContextType | undefined
>(undefined);

export function LocationSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  return (
    <LocationSelectionContext.Provider
      value={{
        selectedLocation,
        coordinates,
        setSelectedLocation,
        setCoordinates,
      }}
    >
      {children}
    </LocationSelectionContext.Provider>
  );
}

export function useLocationSelection() {
  const context = useContext(LocationSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useLocationSelection must be used within a LocationSelectionProvider"
    );
  }
  return context;
}
