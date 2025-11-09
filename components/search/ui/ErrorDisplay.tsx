import React from "react";
import type { MapError } from "@/types/map";

interface ErrorDisplayProps {
  error: MapError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className = "",
}: ErrorDisplayProps) {
  return (
    <div className={`rounded-xl bg-destructive/10 p-5 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-destructive"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-destructive">
            {getErrorTitle(error.type)}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-sm font-medium text-destructive hover:opacity-70 active:opacity-50 transition-all duration-200"
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="text-sm font-medium text-destructive hover:opacity-70 active:opacity-50 transition-all duration-200"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getErrorTitle(type: MapError["type"]): string {
  switch (type) {
    case "search":
      return "Search Error";
    case "api":
      return "Connection Error";
    case "map":
      return "Map Error";
    default:
      return "Error";
  }
}
