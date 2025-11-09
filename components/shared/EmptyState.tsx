import React from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  message,
  className = "py-8",
}: EmptyStateProps) {
  return (
    <div className={`text-center ${className}`}>
      <Icon
        className="w-10 h-10 mx-auto mb-2 text-foreground/40"
        strokeWidth={2}
        aria-hidden="true"
      />
      <p className="text-sm text-foreground/60">{message}</p>
    </div>
  );
}
