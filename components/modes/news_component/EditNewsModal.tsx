"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NewsItem } from "./NewsCard";

interface EditNewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: NewsItem | null;
  onSuccess?: (updatedItem: NewsItem) => void;
}

export function EditNewsModal({
  open,
  onOpenChange,
  item,
  onSuccess,
}: EditNewsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [location_name, setLocationName] = useState("");
  const [status, setStatus] = useState<"Private" | "Published" | "Rejected">(
    "Private"
  );

  // Available categories and severities
  const [categories, setCategories] = useState<
    Array<{ id: number; category: string }>
  >([]);
  const [severities, setSeverities] = useState<
    Array<{ id: number; severity: string }>
  >([]);

  // Load categories and severities on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [catRes, sevRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/severities"),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        if (sevRes.ok) {
          const sevData = await sevRes.json();
          setSeverities(sevData);
        }
      } catch (err) {
        console.error("Failed to load categories/severities:", err);
      }
    };

    if (open) {
      loadOptions();
    }
  }, [open]);

  // Populate form when item changes
  useEffect(() => {
    if (item && open) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setSource(item.source || "");
      setDate(item.date ? new Date(item.date).toISOString().split("T")[0] || "" : "");
      setLocationName(item.location_name || "");
      setStatus((item as any).status || "Private");
      setCategory(item.category?.[0] || "");
      setSeverity(item.severity || "");
      setError(null);
      setSuccess(false);
    }
  }, [item, open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Find category_id and severity_id from the selected values
      const selectedCategoryId = categories.find(
        (c) => c.category === category
      )?.id;
      const selectedSeverityId = severities.find(
        (s) => s.severity === severity
      )?.id;

      // Prepare the update payload - matching the UpdateNewsSchema
      const updateData: Record<string, any> = {
        title: title.trim(),
      };

      if (description.trim()) {
        updateData.description = description.trim();
      }

      if (source.trim()) {
        updateData.source = source.trim();
      }

      if (date) {
        // Convert date to ISO datetime
        const dateObj = new Date(date);
        updateData.date = dateObj.toISOString();
      }

      if (location_name.trim()) {
        updateData.location_name = location_name.trim();
      }

      if (selectedCategoryId) {
        updateData.category_id = selectedCategoryId;
      }

      if (selectedSeverityId) {
        updateData.severity_id = selectedSeverityId;
      }

      if (status) {
        updateData.status = status;
      }

      const response = await fetch(`/api/news/${encodeURIComponent(item.id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      setSuccess(true);

      // Call onSuccess with the updated item
      if (onSuccess && responseData.data) {
        onSuccess(responseData.data);
      }

      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      console.error("Error updating news:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
    >
      <div
        className={cn(
          "relative w-full max-w-md mx-4 max-h-[90vh] bg-background/95 backdrop-blur-xl rounded-2xl border border-border/20 shadow-2xl overflow-hidden flex flex-col",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border/10">
          <div className="flex-1">
            <h2
              id="edit-dialog-title"
              className="text-lg font-semibold text-foreground tracking-tight"
            >
              Edit News Item
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="shrink-0 w-8 h-8 rounded-lg hover:bg-foreground/10 active:bg-foreground/15 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close dialog"
            type="button"
          >
            <X className="h-4 w-4 text-foreground/60" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="News title"
              required
              className="w-full px-3 py-2 border border-border/20 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="News description"
              rows={3}
              className="w-full px-3 py-2 border border-border/20 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-border/20 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Location Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Location Name
            </label>
            <input
              type="text"
              value={location_name}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Bangkok, Thung Khru"
              className="w-full px-3 py-2 border border-border/20 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Source URL
            </label>
            <input
              type="url"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-border/20 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border/20 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">-- Select category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-border/20 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">-- Select severity --</option>
              {severities.map((sev) => (
                <option key={sev.id} value={sev.severity}>
                  {sev.severity}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "Private" | "Published" | "Rejected"
                )
              }
              className="w-full px-3 py-2 border border-border/20 rounded-lg bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="Private">Private</option>
              <option value="Published">Published</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-xs text-green-700">
                News updated successfully!
              </p>
            </div>
          )}
        </form>

        {/* Footer - Actions */}
        <div className="flex items-center gap-3 p-6 pt-4 border-t border-border/10 bg-background/50">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-border/20 bg-background/50 hover:bg-foreground/10 active:bg-foreground/15 text-foreground/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
            type="button"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center gap-2",
              isLoading
                ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
            )}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditNewsModal;
