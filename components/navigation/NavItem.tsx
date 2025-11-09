import { useState } from "react";
import { cn } from "@/lib/utils";
import { Z_INDEX } from "@/lib/constants/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  isExpanded: boolean;
  customIcon?: React.ReactNode;
}

export function NavItem({
  icon: Icon,
  label,
  onClick,
  isExpanded,
  customIcon,
}: NavItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          "w-full h-10 rounded-lg hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-300 flex items-center overflow-hidden",
          isExpanded ? "gap-3 px-3 justify-start" : "justify-center"
        )}
        aria-label={label}
        onMouseEnter={() => !isExpanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="shrink-0">
          {customIcon ||
            (Icon && (
              <Icon className="w-5 h-5 text-foreground/80" aria-hidden="true" />
            ))}
        </div>
        <span
          className={cn(
            "text-sm text-foreground/80 whitespace-nowrap transition-all duration-300",
            isExpanded
              ? "opacity-100 max-w-xs"
              : "opacity-0 max-w-0 overflow-hidden"
          )}
        >
          {label}
        </span>
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
          {label}
        </div>
      )}
    </div>
  );
}
