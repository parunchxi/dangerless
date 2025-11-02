"use client";

import React, { useState, useEffect } from "react";
import { Plus, Minus, Compass, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Z_INDEX } from "@/lib/constants/navigation";
import { useMapData } from "@/lib/contexts";

interface MapControlsProps {
  map?: maplibregl.Map | null;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetNorth?: () => void;
  onGeolocate?: () => void;
  className?: string;
  isGeolocating?: boolean;
}

export function MapControls({
  map,
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onGeolocate,
  className,
  isGeolocating = false,
}: MapControlsProps) {
  const [showGeolocateTooltip, setShowGeolocateTooltip] = useState(false);
  const [showCompassTooltip, setShowCompassTooltip] = useState(false);

  const geolocateRef = React.useRef<HTMLButtonElement>(null);
  const compassRef = React.useRef<HTMLButtonElement>(null);

  const { query } = useMapData();

  useEffect(() => {
    if (!map) return;
    if (!query) {
      map.easeTo({ zoom: 3, duration: 2000 });
    } else {
      map.easeTo({ zoom: 12, duration: 2000 });
    }
  }, []);

  const getTooltipPosition = (
    buttonRef: React.RefObject<HTMLButtonElement | null>
  ) => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.top + rect.height / 2,
      right: window.innerWidth - rect.left + 16, // 16px = mr-4
    };
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Compass and Location Controls Group */}
      <div className="flex flex-col bg-background/75 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden">
        {/* Geolocation Control */}
        {onGeolocate && (
          <div className="relative">
            <Button
              ref={geolocateRef}
              variant="ghost"
              size="icon"
              onClick={onGeolocate}
              onMouseEnter={() => setShowGeolocateTooltip(true)}
              onMouseLeave={() => setShowGeolocateTooltip(false)}
              className={cn(
                "h-10 w-10 rounded-none hover:bg-foreground/10 active:bg-foreground/15 border-b border-border/20 transition-all duration-200",
                isGeolocating &&
                  "bg-primary/90 text-primary-foreground hover:bg-primary active:bg-primary/80"
              )}
              aria-label="Get current location"
              type="button"
              disabled={isGeolocating}
            >
              <Navigation
                className={cn(
                  "h-5 w-5 text-foreground/80",
                  isGeolocating && "text-primary-foreground animate-pulse"
                )}
                strokeWidth={2}
              />
            </Button>
          </div>
        )}

        {/* Compass Control */}
        {onResetNorth && (
          <div className="relative">
            <Button
              ref={compassRef}
              variant="ghost"
              size="icon"
              onClick={onResetNorth}
              onMouseEnter={() => setShowCompassTooltip(true)}
              onMouseLeave={() => setShowCompassTooltip(false)}
              className="h-10 w-10 rounded-none hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200"
              aria-label="Reset north"
              type="button"
            >
              <Compass className="h-5 w-5 text-foreground/80" strokeWidth={2} />
            </Button>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="hidden md:flex flex-col bg-background/75 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="h-10 w-10 rounded-none hover:bg-foreground/10 active:bg-foreground/15 border-b border-border/20 transition-all duration-200"
          aria-label="Zoom in"
          type="button"
        >
          <Plus className="h-5 w-5 text-foreground/80" strokeWidth={2} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="h-10 w-10 rounded-none hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200"
          aria-label="Zoom out"
          type="button"
        >
          <Minus className="h-5 w-5 text-foreground/80" strokeWidth={2} />
        </Button>
      </div>

      {/* Fixed position tooltips */}
      {showGeolocateTooltip && !isGeolocating && (
        <div
          className="fixed px-3 py-2 bg-background/75 backdrop-blur-xl text-foreground/80 text-sm rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            ...getTooltipPosition(geolocateRef),
            zIndex: Z_INDEX.TOOLTIP,
            transform: "translateY(-50%)",
          }}
          role="tooltip"
        >
          My Location
        </div>
      )}

      {showCompassTooltip && (
        <div
          className="fixed px-3 py-2 bg-background/75 backdrop-blur-xl text-foreground/80 text-sm rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            ...getTooltipPosition(compassRef),
            zIndex: Z_INDEX.TOOLTIP,
            transform: "translateY(-50%)",
          }}
          role="tooltip"
        >
          Reset North
        </div>
      )}
    </div>
  );
}
