"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, Z_INDEX } from "@/lib/constants/navigation";
import { NavItem } from "./NavItem";
import { NavUserSection } from "./NavUserSection";
import { NavThemeSwitcher } from "./NavThemeSwitcher";
import { NavLogo } from "./NavLogo";
import type { UserData } from "@/types/navigation";
import type { NavItemId } from "@/lib/constants/navigation";

interface NavigationBarProps {
  onItemClick: (itemId: NavItemId) => void;
  user?: UserData | null;
  onSignIn?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onExpandChange?: (expanded: boolean) => void;
}

export function NavigationBar({
  onItemClick,
  user,
  onSignIn,
  onProfileClick,
  onLogout,
  onExpandChange,
}: NavigationBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  };

  return (
    <nav
      className={cn(
        "fixed left-0 top-0 h-full bg-background/75 backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col border-r border-border/20",
        "max-lg:hidden",
        isExpanded ? "w-64" : "w-16"
      )}
      style={{ zIndex: Z_INDEX.DESKTOP_NAV }}
      aria-label="Main navigation"
    >
      <div className="flex-1 flex flex-col gap-1.5 p-2 pt-4">
        <NavLogo isExpanded={isExpanded} onClick={toggleExpand} />

        <div className="h-px bg-border/40 my-1" role="separator" />

        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => onItemClick(item.id)}
            isExpanded={isExpanded}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1.5 p-2 pb-4">
        <NavThemeSwitcher isExpanded={isExpanded} />

        <div className="h-px bg-border/40 my-1" role="separator" />

        {/* User Section */}
        <NavUserSection
          user={user}
          onSignIn={onSignIn}
          onProfileClick={onProfileClick}
          onLogout={onLogout}
          isExpanded={isExpanded}
        />
      </div>
    </nav>
  );
}
