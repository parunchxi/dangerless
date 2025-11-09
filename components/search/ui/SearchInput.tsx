import React from "react";
import Image from "next/image";
import IconSearch from "@/assets/logo/icon-search.svg";
import { LoadingSpinner } from "./LoadingSpinner";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search for a location",
  loading = false,
  disabled = false,
  className = "",
}: SearchInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && !loading) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <div className="flex items-center w-full rounded-xl overflow-hidden bg-background/75 backdrop-blur-xl shadow-lg border border-border/20">
        {loading ? (
          <LoadingSpinner size="sm" className="px-3" />
        ) : (
          <button
            type="submit"
            className="flex-shrink-0 px-3 hover:bg-foreground/5 active:bg-foreground/10 transition-all duration-200 disabled:opacity-50 h-10"
            disabled={disabled || loading}
            aria-label="Search"
          >
            <Image
              src={IconSearch}
              alt=""
              className="inline-block w-4 h-4 opacity-70"
              aria-hidden="true"
            />
          </button>
        )}
        <input
          aria-label="Search place"
          className="w-full h-10 pr-3 text-sm focus:outline-none bg-transparent disabled:opacity-50 placeholder:text-foreground/50 text-foreground/80"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
        />
      </div>
    </form>
  );
}
