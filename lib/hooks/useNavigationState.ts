import { useState, useCallback } from "react";
import type { NavItemId } from "@/lib/constants/navigation";

interface UseNavigationStateReturn {
  activeTray: NavItemId | null;
  navBarExpanded: boolean;
  toggleTray: (trayId: NavItemId) => void;
  closeTray: () => void;
  setNavBarExpanded: (expanded: boolean) => void;
}

/**
 * Custom hook for managing navigation state (desktop trays and navbar expansion)
 * Provides toggle functionality and tracks which tray is currently open
 */
export function useNavigationState(): UseNavigationStateReturn {
  const [activeTray, setActiveTray] = useState<NavItemId | null>(null);
  const [navBarExpanded, setNavBarExpanded] = useState(false);

  const toggleTray = useCallback((trayId: NavItemId) => {
    setActiveTray((current) => (current === trayId ? null : trayId));
  }, []);

  const closeTray = useCallback(() => {
    setActiveTray(null);
  }, []);

  return {
    activeTray,
    navBarExpanded,
    toggleTray,
    closeTray,
    setNavBarExpanded,
  };
}
