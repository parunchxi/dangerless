import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared";
import LinkPreview from "@/components/shared/LinkPreview"

const REPORT_FIELDS = [
  { id: "report-title", label: "Title", placeholder: "Brief description" },
  {
    id: "report-location",
    label: "Location",
    placeholder: "Where is this happening?",
  },
  {
    id: "report-date",
    label: "Date",
    placeholder: "When did this happen?",
    type: "date" as const,
  },
  {
    id: "report-source",
    label: "Source",
    placeholder: "Where did you find this information?",
  },
  {
    id: "report-description",
    label: "Description",
    placeholder: "Provide details...",
    type: "textarea" as const,
  },
] as const;

export function AddNewsMode() {
  const handleSubmit = () => {
    // Form submission implementation pending
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {REPORT_FIELDS.map((field) => (
        <FormField key={field.id} {...field} />
      ))}
      <Button
        type="submit"
        className="w-full rounded-xl h-10 bg-primary hover:bg-primary/90 transition-all shadow-md"
      >
        <Send className="w-4 h-4 mr-2" strokeWidth={2} />
        Submit Report
      </Button>

      <div className="p-2.5 rounded-xl bg-foreground/5 border border-border/10">
        <p className="text-xs text-foreground/60">
          Reports are reviewed and shared with the community.
        </p>
      </div>
    </form>
  );
}
