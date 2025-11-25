"use client";

import React, { createContext, useContext, useState } from "react";

export type MarkerNewItem = {
  id: string;
  title: string;
  description?: string;
  source?: string;
  date?: string;
  severity?: "info" | "warning" | "danger" | string;
  category?: string[];
  location?: { lat: number; lon: number } | null;
  location_name?: string | null;
};

type MarkerNewContextValue = {
  items: MarkerNewItem[];
  setItems: (items: MarkerNewItem[]) => void;
  addItem: (item: MarkerNewItem) => void;
  removeItem: (id: string) => void;
};

const MarkerNewContext = createContext<MarkerNewContextValue | undefined>(
  undefined
);

export function MarkerNewProvider({
  children,
  initialItems = [],
}: {
  children: React.ReactNode;
  initialItems?: MarkerNewItem[];
}) {
  const [items, setItems] = useState<MarkerNewItem[]>(initialItems);

  const addItem = (item: MarkerNewItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <MarkerNewContext.Provider value={{ items, setItems, addItem, removeItem }}>
      {children}
    </MarkerNewContext.Provider>
  );
}

export function useMarkerNew() {
  const ctx = useContext(MarkerNewContext);
  if (!ctx)
    throw new Error("useMarkerNew must be used within MarkerNewProvider");
  return ctx;
}

export default MarkerNewContext;
