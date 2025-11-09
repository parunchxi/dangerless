import React from "react";
import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/shared";

export function NewsMode() {
  const newsItems: any[] = [];

  if (newsItems.length === 0) {
    return (
      <EmptyState icon={Newspaper} message="No news updates at the moment" />
    );
  }

  return (
    <div className="space-y-2">
      {/* News items will be rendered here when available */}
    </div>
  );
}
