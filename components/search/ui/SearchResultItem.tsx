import React from "react";
import Image from "next/image";
import IconLOC from "@/assets/logo/icon-location.svg";

interface SearchResultItemProps {
  displayName: string;
  isSelected: boolean;
  onClick: () => void;
}

export function SearchResultItem({
  displayName,
  isSelected,
  onClick,
}: SearchResultItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200 border-b border-border/10 last:border-0 ${
        isSelected ? "bg-foreground/15" : ""
      } text-sm whitespace-normal break-words`}
    >
      <div className="flex items-start gap-2.5">
        <Image
          src={IconLOC}
          alt=""
          className="flex-shrink-0 mt-0.5 w-4 h-4 opacity-60"
          aria-hidden="true"
        />
        <span className="flex-1 text-foreground/80 leading-relaxed">
          {displayName}
        </span>
      </div>
    </button>
  );
}
