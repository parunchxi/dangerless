"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleCancel();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Trap focus within dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      const focusableElements = [
        cancelButtonRef.current,
        confirmButtonRef.current,
      ];
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
    >
      <div
        className={cn(
          "relative w-full max-w-md mx-4 bg-background/95 backdrop-blur-xl rounded-2xl border border-border/20 shadow-2xl overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex-1">
            <h2
              id="dialog-title"
              className="text-lg font-semibold text-foreground tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                id="dialog-description"
                className="text-sm text-muted-foreground mt-2 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="shrink-0 w-8 h-8 rounded-lg hover:bg-foreground/10 active:bg-foreground/15 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Close dialog"
            type="button"
          >
            <X className="h-4 w-4 text-foreground/60" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 pt-2">
          <button
            ref={cancelButtonRef}
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-border/20 bg-background/50 hover:bg-foreground/10 active:bg-foreground/15 text-foreground/80 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            type="button"
            aria-label={`${cancelLabel} and close dialog`}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
            )}
            type="button"
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
