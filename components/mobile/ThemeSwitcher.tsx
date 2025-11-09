"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    const themes = ["light", "dark", "system"];
    const currentTheme = theme || "system";
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    if (nextTheme) {
      setTheme(nextTheme);
    }
  };

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

  const Icon = getIcon();

  return (
    <div className="mt-1">
      <button
        onClick={cycleTheme}
        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-foreground/5 active:bg-foreground/10 transition-all"
        aria-label={`Current theme: ${getLabel()}. Click to cycle themes.`}
      >
        <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-foreground/80" aria-hidden="true" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground/90">{getLabel()}</p>
          <p className="text-xs text-foreground/60">Click to change theme</p>
        </div>
      </button>
    </div>
  );
}
