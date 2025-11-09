"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Z_INDEX } from "@/lib/constants/navigation";

interface SidebarTrayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  leftOffset?: number;
}

const TRAY_WIDTH = 400;

export function SidebarTray({
  isOpen,
  onClose,
  title,
  children,
  className,
  leftOffset = 64,
}: SidebarTrayProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 h-full bg-background/75 backdrop-blur-xl border-r border-border/20 shadow-lg transition-all duration-300 ease-in-out hidden lg:flex flex-col",
        isOpen
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0 pointer-events-none",
        className
      )}
      style={{
        left: `${leftOffset}px`,
        width: `${TRAY_WIDTH}px`,
        zIndex: Z_INDEX.DESKTOP_TRAY,
      }}
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <h2 className="text-base font-semibold text-foreground/80">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-foreground/10 active:bg-foreground/15 transition-all rounded-lg"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-foreground/80" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </aside>
  );
}
