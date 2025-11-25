import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared";
import { useLocationSelection } from "@/lib/contexts/LocationSelectionContext";
import { useMapSelection } from "@/lib/hooks";
import { useAuth } from "@/lib/hooks/useAuth";

const REPORT_FIELDS = [
  {
    id: "report-title",
    label: "Title",
    placeholder: "Brief description",
    required: true,
  },
  {
    id: "report-location",
    label: "Location",
    placeholder: "Where is this happening?",
    type: "location" as const,
    required: true,
  },
  {
    id: "report-date",
    label: "Date",
    placeholder: "When did this happen?",
    type: "date" as const,
    required: true,
  },
  {
    id: "report-category",
    label: "Category",
    placeholder: "-- Select a category --",
    type: "select" as const,
    options: [
      { value: "Caution" },
      { value: "Natural Hazard" },
      { value: "Violence" },
      { value: "Accidents" },
    ] as { value: string }[],
    required: true,
  },
  {
    id: "report-source",
    label: "Source",
    placeholder: "Where did you find this information?",
    required: true,
  },
  {
    id: "report-description",
    label: "Description",
    placeholder: "Provide details...",
    type: "textarea" as const,
    required: false,
  },
] as const;

export function AddNewsMode() {
  const { coordinates } = useLocationSelection();
  const { results, selectedIndex } = useMapSelection();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!coordinates || selectedIndex === null) {
      setError("Please select a valid location for the report.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const newsData = {
        title: formData.get("report-title"),
        location: {
          name: results?.[selectedIndex]?.display_name || "Unknown location",
          lat: coordinates.lat,
          lon: coordinates.lng,
          address_district:
            results?.[selectedIndex]?.display_name || "Unknown district",
        },
        news_source: formData.get("report-source"),
        news_date: formData.get("report-date"),
        category: formData.get("report-category"),
        description: formData.get("report-description"),
        recommended_action: "To be determined",
        status: "Private",
        owner: user?.id || "userUID",
        severity_id: null,
      };

      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit report");
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error submitting report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
    >
      {REPORT_FIELDS.map((field) => (
        <FormField key={field.id} {...field} />
      ))}

      {error && (
        <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
          <p className="text-xs text-green-700">
            Report submitted successfully!
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl h-10 bg-primary hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" strokeWidth={2} />
            Submit Report
          </>
        )}
      </Button>

      <div className="p-2.5 rounded-xl bg-foreground/5 border border-border/10">
        <p className="text-xs text-foreground/60">
          Reports are reviewed and shared with the community.
        </p>
      </div>
    </form>
  );
}
