import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import LinkPreview from "./LinkPreview";

interface FormFieldProps {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "date";
  rows?: number;
  className?: string;
  required?: boolean;
}

export function FormField({
  id,
  label,
  placeholder,
  type = "text",
  rows = 3,
  className,
  required = false,
}: FormFieldProps) {
  const baseInputClass =
    "rounded-xl border-border/20 bg-background/50 focus:bg-background/75 transition-colors";
  const [url, setUrl] = React.useState("");

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground/80">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {type === "textarea" ? (
        <textarea
          id={id}
          placeholder={placeholder}
          name={id}
          rows={rows}
          className={cn(
            "w-full px-3 py-2 focus:border-border/40 focus:outline-none focus:ring-1 focus:ring-ring/20 resize-none text-sm",
            baseInputClass
          )}
        />
      ) : (
        <>
          <Input
            required={required}
            id={id}
            type={type}
            placeholder={placeholder}
            name={id}
            className={cn(
              "h-10 ",
              baseInputClass,
              type === "date" ? "w-fit" : ""
            )}
            value={id === "report-source" ? url : undefined}
            onChange={
              id === "report-source" ? (e) => setUrl(e.target.value) : undefined
            }
          />
          {id === "report-source" && url && <LinkPreview url={url} />}
        </>
      )}
    </div>
  );
}
