"use client";

import * as React from "react";
import { useRef, useState, useLayoutEffect } from "react";
import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { NewsCard } from "./NewsCard";
import { NewsModal } from "./NewsModal";
import AreaInfoCard, { type AreaInfo } from "./AreaInfoCard";

interface NewsListProps {
  items: NewsItem[];
  area?: AreaInfo;
  // optional controlled date range forwarded to AreaInfoCard
  fromDate?: string;
  toDate?: string;
  onDateRangeChange?: (from?: string, to?: string) => void;
  // Pass preview image as second arg so modal can reuse already loaded image
  onItemClick?: (item: NewsItem, previewImage?: string) => void;
}

export function NewsList({ items, area, fromDate, toDate, onDateRangeChange, onItemClick }: NewsListProps) {

  const areaRef = useRef<HTMLDivElement | null>(null);
  const [areaHeight, setAreaHeight] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!areaRef.current) return;
    const el = areaRef.current;

    const measure = () => {
      // Measure the wrapper height but subtract the visual separator's height
      const total = el.getBoundingClientRect().height || 0;
      const sep = el.querySelector('.border-b');
      const sepHeight = sep ? (sep.getBoundingClientRect().height || (sep as HTMLElement).offsetHeight) : 0;
      setAreaHeight(Math.max(0, total - sepHeight));
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // initial measure
    measure();
    return () => ro.disconnect();
  }, [areaRef, area]);

  return (
    <div>
      {area && (
        <div ref={areaRef} className="sticky top-0 z-20 bg-transparent">
          <AreaInfoCard
            area={area}
            fromDate={fromDate}
            toDate={toDate}
            onDateRangeChange={onDateRangeChange}
            onToggleCollapsed={() => {
              // measure immediately when the card is collapsed/expanded to avoid a visible jump
              const el = areaRef.current;
              if (el) {
                const total = el.getBoundingClientRect().height || 0;
                const sep = el.querySelector('.border-b');
                const sepHeight = sep ? (sep.getBoundingClientRect().height || (sep as HTMLElement).offsetHeight) : 0;
                setAreaHeight(Math.max(0, total - sepHeight));
              }
            }}
          />
        </div>
      )}
      {/* news cards list with padding to avoid being hidden under the area info card */}
      <div style={areaHeight ? { paddingTop: areaHeight - 300 } : undefined} className="space-y-1">
        {(!items || items.length === 0) ? (
          <EmptyState icon={Newspaper} message="No news updates at the moment" />
        ) : (
          items.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onClick={(img) => {
                setSelected(item);
                setSelectedPreview(img ?? null);
                setOpen(true);
              }}
            />
          ))
        )}
      </div>
      <NewsModal
        open={open}
        item={selected}
        previewImage={selectedPreview}
        onClose={() => {
          setOpen(false);
          setSelected(null);
          setSelectedPreview(null);
        }}
      />
    </div>
  );
}

export default NewsList;
