"use client";

import { useEffect } from "react";
import { Newspaper, AlertTriangle } from "lucide-react";
import { useDraggableSheet } from "@/lib/hooks/useDraggableSheet";
import { Z_INDEX } from "@/lib/constants/navigation";
import {
  DragHandle,
  CollapsibleSection,
  UserSection,
  ThemeSwitcher,
} from "./mobile";
import type { UserData } from "@/types/navigation";

interface MobileBottomSheetProps {
  searchContent: React.ReactNode;
  newsContent: React.ReactNode;
  reportContent: React.ReactNode;
  user?: UserData | null;
  onSignIn?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
}

const SECTIONS = [
  { id: "news", icon: Newspaper, title: "News" },
  { id: "report", icon: AlertTriangle, title: "Report" },
] as const;

export function MobileBottomSheet({
  searchContent,
  newsContent,
  reportContent,
  user,
  onSignIn,
  onProfileClick,
  onLogout,
  onExpandedChange,
}: MobileBottomSheetProps) {
  const {
    dragHeight,
    isDragging,
    isExpanded,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    expand,
    sheetRef,
  } = useDraggableSheet();

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  const contentMap = {
    news: newsContent,
    report: reportContent,
  };

  return (
    <div
      ref={sheetRef}
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/75 backdrop-blur-xl rounded-t-xl shadow-lg border-t border-border/20 flex flex-col overflow-hidden"
      style={{
        height: `${dragHeight}px`,
        touchAction: isDragging ? "none" : "auto",
        transition: isDragging
          ? "none"
          : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: Z_INDEX.MOBILE_NAV,
      }}
    >
      <DragHandle
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      />

      <div className="flex-1 overflow-auto px-4 pb-safe">
        <div className="mb-4" onClick={expand}>
          {searchContent}
        </div>

        {isExpanded && (
          <div className="space-y-1 pb-4">
            {SECTIONS.map((section) => (
              <CollapsibleSection
                key={section.id}
                icon={section.icon}
                title={section.title}
              >
                <div className="mt-2">{contentMap[section.id]}</div>
              </CollapsibleSection>
            ))}

            <ThemeSwitcher />

            <UserSection
              user={user}
              onSignIn={onSignIn}
              onProfileClick={onProfileClick}
              onLogout={onLogout}
            />
          </div>
        )}
      </div>
    </div>
  );
}
