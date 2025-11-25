"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AreaStatusContextType {
  areaStatus: string | undefined;
  setAreaStatus: (status: string | undefined) => void;
}

const AreaStatusContext = createContext<AreaStatusContextType | undefined>(
  undefined
);

export function useAreaStatus() {
  const context = useContext(AreaStatusContext);
  if (!context) {
    throw new Error("useAreaStatus must be used within AreaStatusProvider");
  }
  return context;
}

interface AreaStatusProviderProps {
  children: ReactNode;
}

export function AreaStatusProvider({ children }: AreaStatusProviderProps) {
  const [areaStatus, setAreaStatus] = useState<string | undefined>(undefined);

  const value: AreaStatusContextType = {
    areaStatus,
    setAreaStatus,
  };

  return (
    <AreaStatusContext.Provider value={value}>
      {children}
    </AreaStatusContext.Provider>
  );
}
