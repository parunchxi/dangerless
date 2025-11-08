import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import LinkPreview from "./LinkPreview";
import { Button } from "../ui/button";
import { useMapMode } from "@/lib/contexts";
import { useNavigationState } from "@/lib/hooks";
import { useLocationSelection } from "@/lib/contexts/LocationSelectionContext";
import { useMapSelection } from "@/lib/hooks";
import { MAP_MODES } from "@/lib/constants";
import { LoadingSpinner } from "../search/ui";
import IconSearch from "@/assets/logo/icon-search.svg";

interface FormFieldProps {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "date" | "location" | "select";
  options?: { value: string }[];
  rows?: number;
  className?: string;
  required?: boolean;
}

export function FormField({
  id,
  label,
  placeholder,
  type = "text",
  options,
  rows = 3,
  className,
  required = false,
}: FormFieldProps) {
  const baseInputClass =
    "rounded-xl border-border/20 bg-background/50 focus:bg-background/75 transition-colors";
  const [url, setUrl] = React.useState("");
  const { mode, setMode } = useMapMode();
  const { closeTray } = useNavigationState();
  const { selectedLocation, coordinates } = useLocationSelection();
  const { results, selectedIndex } = useMapSelection();
  const isSelectingLocation = mode === MAP_MODES.SELECT_LOCATION;

  const handleLocationSelect = () => {
    closeTray(); // Close any open tray
    setMode(MAP_MODES.SELECT_LOCATION); // Set map to location selection mode
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground/80">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {type === "select" && options && (
        <select
          id={id}
          name={id}
          className={cn(
            "w-full appearance-none px-3 py-2 focus:border-border/40 focus:outline-none focus:ring-1 focus:ring-ring/20 text-sm ",
            baseInputClass
          )}
          required={required}
        >
          <option value="" disabled selected>
            {placeholder || "Select an option"}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>
      )}
      {type === "location" && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            type="button"
            className="w-full py-6 text-wrap"
            onClick={handleLocationSelect}
            disabled={isSelectingLocation || !results || selectedIndex === null}
          >
            {selectedIndex !== null ? (
              isSelectingLocation ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-1" />
                    "Waiting for location selection in map ..."
                </>
              ) : (
                "Select Location From Map"
              )
            ) : (
              <>
                <Image
                  src={IconSearch}
                  alt=""
                  className="inline-block w-4 h-4 opacity-70"
                  aria-hidden="true"
                />
                  Please search and select an area first
              </>
            )}
          </Button>
          {coordinates && (
            <div className="text-xs text-muted-foreground">
              Latitude: {coordinates.lat.toFixed(6)}, Longitude:{" "}
              {coordinates.lng.toFixed(6)} <br />
              Name: {selectedLocation}
              {results && selectedIndex !== null && (
                <div className="mt-1 text-xs text-foreground/70 italic text-wrap">
                  Area:{" "}
                  {results?.[selectedIndex]?.display_name ?? "Unknown address"}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {type === "textarea" && (
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
      )}
      {(type === "text" || type === "date") && (
        <div className="flex flex-col gap-5">
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
        </div>
      )}
    </div>
  );
}
