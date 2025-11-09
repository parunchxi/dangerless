import React from "react";

interface TrayHeaderProps {
  title: string;
  description?: string;
}

export function TrayHeader({ title, description }: TrayHeaderProps) {
  return (
    <div className="mb-3">
      <h3 className="text-xs font-semibold text-foreground/60 mb-1 uppercase tracking-wide">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-foreground/50">{description}</p>
      )}
    </div>
  );
}

interface TrayContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TrayContainer({
  children,
  className = "p-4",
}: TrayContainerProps) {
  return <div className={className}>{children}</div>;
}
