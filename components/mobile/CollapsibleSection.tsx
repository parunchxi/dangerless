"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleSection({
  icon: Icon,
  title,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-foreground/5 active:bg-foreground/10 transition-all duration-200"
        aria-expanded={isExpanded}
        aria-label={`${title} section`}
      >
        <Icon
          className="w-5 h-5 flex-shrink-0 text-foreground/80"
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="flex-1 text-left text-sm font-medium text-foreground/80">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200 flex-shrink-0 text-foreground/60",
            isExpanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      {isExpanded && (
        <div className="px-2.5 pb-2 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
