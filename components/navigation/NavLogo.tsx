"use client";

import { useState } from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { Z_INDEX } from "@/lib/constants/navigation";

interface NavLogoProps {
  isExpanded: boolean;
  onClick: () => void;
}

export function NavLogo({ isExpanded, onClick }: NavLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        onMouseEnter={() => {
          setIsHovered(true);
          if (!isExpanded) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        className={cn(
          "w-full h-12 rounded-lg hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-300 flex items-center overflow-hidden",
          isExpanded ? "gap-2 px-3 justify-between" : "justify-center"
        )}
        aria-label={isExpanded ? "Collapse" : "Expand"}
      >
        {isExpanded ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 shrink-0">
                <img
                  src="/assets/logo/dangerless.svg"
                  alt="Dangerless"
                  className="w-full h-full dark:invert"
                />
              </div>
              <span className="text-base font-semibold text-foreground/90 whitespace-nowrap">
                Dangerless
              </span>
            </div>
            <PanelLeftClose
              className="w-5 h-5 shrink-0 text-foreground/80"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="relative shrink-0 flex items-center justify-center">
            {isHovered ? (
              <PanelLeftOpen
                className="w-5 h-5 text-foreground/80"
                aria-hidden="true"
              />
            ) : (
              <div className="w-6 h-6">
                <img
                  src="/assets/logo/dangerless.svg"
                  alt="Dangerless"
                  className="w-full h-full dark:invert"
                />
              </div>
            )}
          </div>
        )}
      </button>

      {!isExpanded && showTooltip && (
        <div
          className="absolute left-full ml-4 px-3 py-2 bg-background/75 backdrop-blur-xl text-foreground/80 text-sm rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            zIndex: Z_INDEX.TOOLTIP,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          role="tooltip"
        >
          Expand
        </div>
      )}
    </div>
  );
}
