"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

export type DangerLevel = "critical" | "warning" | "info" | "normal";

export interface HistoricalEvent {
  title: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
}

export interface AreaInfo {
  // `status` now holds the raw backend risk level string (e.g. 'low', 'moderate', 'high', 'critical')
  status?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  country?: string;
  historicalEvents?: HistoricalEvent[];
}

interface AreaInfoCardProps {
  area: AreaInfo;
  // optional controlled date range inputs and change handler
  fromDate?: string;
  toDate?: string;
  onDateRangeChange?: (from?: string, to?: string) => void;
  onToggleCollapsed?: (collapsed: boolean) => void;
}

export function AreaInfoCard({
  area,
  fromDate,
  toDate,
  onDateRangeChange,
  onToggleCollapsed,
}: AreaInfoCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Determine badge variant from backend risk level string
  const statusVariant = (status?: string) => {
    if (!status) return "outline";
    const s = String(status).toLowerCase().trim();
    switch (s) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      case "moderate":
      case "medium":
        return "default";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  // Display the backend status string as-is (do not remap the value)
  // Low Moderate High Critical
  const statusLabel = (status?: string) => status ?? "";

  // Get color for the Risk Level label based on severity
  const statusColor = (status?: string) => {
    if (!status) return "text-muted-foreground";
    const s = String(status).toLowerCase().trim();
    switch (s) {
      case "critical":
        return "text-red-600 dark:text-red-400";
      case "high":
        return "text-orange-600 dark:text-orange-400";
      case "moderate":
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  // Get background color for the Badge based on severity
  const badgeColor = (status?: string) => {
    if (!status) return {};
    const s = String(status).toLowerCase().trim();
    switch (s) {
      case "critical":
        return { backgroundColor: "#e11d48", color: "white" };
      case "high":
        return { backgroundColor: "#f59e0b", color: "white" };
      case "moderate":
      case "medium":
        return { backgroundColor: "#eab308", color: "black" };
      case "low":
        return { backgroundColor: "#22c55e", color: "white" };
      default:
        return {};
    }
  };

  return (
    <div className="relative">
      <Card className="mb-1 relative z-40">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Selected area</CardTitle>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium}`}
              >
                Risk Level:
              </span>
              <Badge style={badgeColor(area.status)}>
                {statusLabel(area.status)}
              </Badge>
              <button
                aria-label={
                  collapsed ? "Expand area info" : "Collapse area info"
                }
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  // toggle and notify parent so it can re-measure immediately
                  setCollapsed((s) => {
                    const newState = !s;
                    try {
                      onToggleCollapsed?.(newState);
                    } catch (e) {
                      // ignore
                    }
                    return newState;
                  });
                }}
              >
                {collapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </CardHeader>

        {!collapsed && (
          <CardContent>
            <dl className="flex flex-col gap-2 text-sm text-muted-foreground">
              {/* Sub-district removed from the UI per request */}
              {area.district && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-medium text-foreground">District</dt>
                  <dd className="ml-4 text-right truncate">{area.district}</dd>
                </div>
              )}
              {area.province && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-medium text-foreground">Province</dt>
                  <dd className="ml-4 text-right truncate">{area.province}</dd>
                </div>
              )}
              {area.country && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-medium text-foreground">Country</dt>
                  <dd className="ml-4 text-right truncate">{area.country}</dd>
                </div>
              )}

              {/* Historical Events subsection (inside same card) */}
              <div className="pt-2 border-t border-muted-foreground/10">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Historical Events
                </h4>

                {/* Duration inputs for filtering events: 'To' moved to its own line to fit */}
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">
                      From
                    </label>
                    <input
                      type="date"
                      value={fromDate ?? ""}
                      onChange={(e) =>
                        onDateRangeChange?.(e.target.value || undefined, toDate)
                      }
                      className="w-40 max-w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">To</label>
                    <input
                      type="date"
                      value={toDate ?? ""}
                      onChange={(e) =>
                        onDateRangeChange?.(
                          fromDate,
                          e.target.value || undefined
                        )
                      }
                      className="w-40 max-w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                {/* Historical events list removed per request. Only date inputs remain. */}
              </div>
            </dl>
          </CardContent>
        )}
      </Card>

      {/* visual separator so news items below are clearly separated */}
      <div className="h-3" aria-hidden />
      <div
        aria-hidden
        className="absolute left-0 right-0 bottom-0 h-12 pointer-events-none z-30 bg-gradient-to-b from-background/100 to-transparent"
      />
    </div>
  );
}

export default AreaInfoCard;
