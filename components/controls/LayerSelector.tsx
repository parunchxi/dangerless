"use client";

import React, { useState, useRef, useEffect } from "react";
import { Layers, MapIcon, Globe, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMapLayer } from "@/lib/contexts";
import { MAP_LAYERS, MAP_LAYER_INFO } from "@/lib/constants";
import { Z_INDEX } from "@/lib/constants/navigation";
import type { MapLayer } from "@/types/map";

const LAYER_ICONS: Record<MapLayer, typeof MapIcon> = {
  [MAP_LAYERS.STANDARD]: MapIcon,
  [MAP_LAYERS.SATELLITE]: Globe,
  [MAP_LAYERS.HYBRID]: MapPin,
};

export function LayerSelector() {
  const { layer, setLayer } = useMapLayer();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getTooltipPosition = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.top + rect.height / 2,
      right: window.innerWidth - rect.left + 16, // 16px = mr-4
    };
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 200; // Approximate height of the menu

      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLayerChange = (newLayer: MapLayer) => {
    setLayer(newLayer);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Main Button */}
      <div className="bg-background/75 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={cn(
            "h-10 w-10 rounded-none hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200",
            isOpen && "bg-foreground/10"
          )}
          aria-label="Change map layer"
          type="button"
        >
          <Layers className="h-5 w-5 text-foreground/80" strokeWidth={2} />
        </Button>
      </div>

      {/* Layer Options Panel */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-full mr-4 min-w-[200px] bg-background/75 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden",
            menuPosition === "bottom" ? "top-0" : "bottom-0"
          )}
          style={{ zIndex: Z_INDEX.TOOLTIP }}
        >
          {(Object.keys(MAP_LAYERS) as Array<keyof typeof MAP_LAYERS>).map(
            (key) => {
              const layerValue = MAP_LAYERS[key];
              const layerInfo = MAP_LAYER_INFO[layerValue];
              const isActive = layer === layerValue;
              const LayerIcon = LAYER_ICONS[layerValue];

              return (
                <button
                  key={layerValue}
                  onClick={() => handleLayerChange(layerValue)}
                  className={cn(
                    "w-full px-3 py-2.5 flex items-center gap-3 hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200 text-left border-b border-border/20 last:border-b-0",
                    isActive &&
                      "bg-primary/90 text-primary-foreground hover:bg-primary active:bg-primary/80"
                  )}
                >
                  <LayerIcon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive
                        ? "text-primary-foreground"
                        : "text-foreground/80"
                    )}
                    aria-hidden="true"
                    strokeWidth={2}
                  />
                  <div className="flex-1">
                    <div
                      className={cn(
                        "text-sm",
                        isActive
                          ? "text-primary-foreground"
                          : "text-foreground/80"
                      )}
                    >
                      {layerInfo.name}
                    </div>
                  </div>
                  {isActive && (
                    <Check
                      className="w-5 h-5 text-primary-foreground"
                      aria-hidden="true"
                      strokeWidth={2}
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Fixed position tooltip */}
      {showTooltip && !isOpen && (
        <div
          className="fixed px-3 py-2 bg-background/75 backdrop-blur-xl text-foreground/80 text-sm rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            ...getTooltipPosition(),
            zIndex: Z_INDEX.TOOLTIP,
            transform: "translateY(-50%)",
          }}
          role="tooltip"
        >
          Map Style
        </div>
      )}
    </div>
  );
}
