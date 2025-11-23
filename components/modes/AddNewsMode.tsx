import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared";

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Form submission implementation pending
    console.log("Form submitted");
    // You can access form data here
    const formData = new FormData(e.currentTarget);
    console.log("Form data:", Object.fromEntries(formData.entries()));
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