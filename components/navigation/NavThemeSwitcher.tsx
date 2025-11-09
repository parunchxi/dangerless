"use client";

import { useEffect, useState, useRef } from "react";
import { Laptop, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Z_INDEX } from "@/lib/constants/navigation";

interface NavThemeSwitcherProps {
  isExpanded: boolean;
}

export function NavThemeSwitcher({ isExpanded }: NavThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom");
  const { theme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 150; // Approximate height of the menu

      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
  }, [showMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  if (!mounted) {
    return null;
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return Sun;
      case "dark":
        return Moon;
      default:
        return Laptop;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light Theme";
      case "dark":
        return "Dark Theme";
      default:
        return "System Theme";
    }
  };

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  const Icon = getIcon();

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        onMouseEnter={() => !isExpanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "w-full h-10 rounded-lg hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-300 flex items-center overflow-hidden",
          isExpanded ? "gap-3 px-3 justify-start" : "justify-center"
        )}
        aria-label={`Current theme: ${getLabel()}. Click to change theme.`}
      >
        <div className="shrink-0">
          <Icon className="w-5 h-5 text-foreground/80" aria-hidden="true" />
        </div>
        <span
          className={cn(
            "text-sm text-foreground/80 whitespace-nowrap transition-all duration-300",
            isExpanded
              ? "opacity-100 max-w-xs"
              : "opacity-0 max-w-0 overflow-hidden"
          )}
        >
          {getLabel()}
        </span>
      </button>

      {!isExpanded && showTooltip && !showMenu && (
        <div
          className="absolute left-full ml-4 px-3 py-2 bg-background/75 backdrop-blur-xl text-foreground/80 text-sm rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            zIndex: Z_INDEX.TOOLTIP,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          role="tooltip"
        >
          Theme
        </div>
      )}

      {showMenu && (
        <div
          className={cn(
            "absolute left-full ml-4 bg-background/75 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden",
            menuPosition === "bottom" ? "top-0" : "bottom-0"
          )}
          style={{ zIndex: Z_INDEX.TOOLTIP }}
        >
          {themes.map(({ id, label, icon: ThemeIcon }) => (
            <button
              key={id}
              onClick={() => {
                setTheme(id);
                setShowMenu(false);
              }}
              className={cn(
                "w-full px-3 py-2.5 flex items-center gap-3 hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200 text-left border-b border-border/20 last:border-b-0",
                theme === id &&
                  "bg-primary/90 text-primary-foreground hover:bg-primary active:bg-primary/80"
              )}
            >
              <ThemeIcon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  theme === id
                    ? "text-primary-foreground"
                    : "text-foreground/80"
                )}
                aria-hidden="true"
                strokeWidth={2}
              />
              <span
                className={cn(
                  "text-sm flex-1",
                  theme === id
                    ? "text-primary-foreground"
                    : "text-foreground/80"
                )}
              >
                {label}
              </span>
              {theme === id && (
                <Check
                  className="w-5 h-5 text-primary-foreground"
                  aria-hidden="true"
                  strokeWidth={2}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
