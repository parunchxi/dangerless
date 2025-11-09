import { Newspaper, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Navigation bar width constants
 */
export const NAV_BAR_WIDTH = {
  COLLAPSED: 64,
  EXPANDED: 256,
} as const;

/**
 * Mobile bottom sheet height snap points
 */
export const MOBILE_SHEET_HEIGHT = {
  MIN: 120, // Collapsed - just search bar visible
  MAX_PERCENT: 0.95, // Expanded - 95% of screen height (nearly full screen)
} as const;

/**
 * Z-index layering system for consistent stacking
 */
export const Z_INDEX = {
  MAP: 0,
  MAP_CONTROLS: 50,
  DESKTOP_TRAY: 60,
  DESKTOP_NAV: 70,
  MOBILE_NAV: 70,
  TOOLTIP: 80,
} as const;

/**
 * Navigation item configuration
 */
export interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

/**
 * Main navigation items with their icons and labels
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: "news", icon: Newspaper, label: "News" },
  { id: "report", icon: AlertTriangle, label: "Report" },
] as const;

export type NavItemId = (typeof NAV_ITEMS)[number]["id"];
