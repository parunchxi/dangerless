"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import LinkPreview from "@/components/shared/LinkPreview";
import { ExternalLink, MapPin } from "lucide-react";
import { useMapView } from "@/lib/contexts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  // `source` is now the canonical URL for the news item (was previously `url`)
  source?: string;
  date?: string; // ISO string (was publishedAt)
  severity?: "critical" | "warning" | "info" | "normal"; // was status
  category?: string[]; // was tags
  // optional geo location for the news item — use `lon` not `lng`
  location?: { lat: number; lon: number } | null;
  // optional brief human-friendly location name to display under the date (snake_case)
  location_name?: string | null;
}

interface NewsCardProps {
  item: NewsItem;
  onClick?: () => void;
}

export function NewsCard({ item, onClick }: NewsCardProps) {
  // show only the date (no time)
  const dateOnly = item.date ? new Date(item.date).toLocaleDateString() : "";
  const { focusOnLocation } = useMapView();

  // Fetch link preview image client-side for the news card
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPreview = async () => {
      if (!item.source) return;
        setPreviewLoading(true);
      try {
          const res = await fetch(`/api/link-preview?url=${encodeURIComponent(item.source)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.image) setPreviewImage(data.image);
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };
    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [item.source]);

  const statusVariant = (status?: string) => {
    switch (status) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      default:
        return "outline";
    }
  };

  const statusLabel = (status?: string) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const [showPopup, setShowPopup] = useState(false);

  return (
    <article className="news-card cursor-pointer" onClick={onClick} role="button" tabIndex={0}>
      {/* pin button: don't open modal */}
      {item.location && (
        <button
          onClick={(e) => {
            e.stopPropagation();          // <-- important
            try {
              const loc = item.location!;
              // build a minimal Nominatim-like result
              const result = {
                display_name: item.title || item.description || "Selected location",
                lat: String(loc.lat),
                lon: String((loc as any).lon || ""),
              } as any;
              focusOnLocation(result);
            } catch (e) {
              // ignore
            }
          }}
          aria-label="Show on map"
          className="map-pin-btn"
        >
          <MapPin className="w-6 h-6" />
          <span className="sr-only">Show location on map</span>
        </button>
      )}

      {/* source link:  don't open modal */}
      {item.source && (
        <a
          href={item.source}
          onClick={(e) => {
            e.stopPropagation();          
          }}
          target="_blank"
          rel="noreferrer"
        >
          Source
        </a>
      )}

      {/* reste du contenu de la card */}
      {/* Status badge inside the card (top-left) */}
      {item.severity && (
        <div className="absolute top-2 left-4 z-10">
          <Badge variant={statusVariant(item.severity)}>{statusLabel(item.severity)}</Badge>
        </div>
      )}
  <CardHeader className="pl-8 pr-12">
        <CardTitle className="truncate whitespace-nowrap" title={item.title}>{item.title}</CardTitle>
        {/* `source` is the article URL now; we don't render it here as a publisher label */}
      </CardHeader>
      {item.description && (
        <CardContent>
          {/* Stack image above the summary so the image always appears on top */}
          {previewImage && (
            <div className="w-full mb-2">
              <img
                src={previewImage}
                alt={item.title}
                className="w-full h-40 object-cover rounded-md"
              />
            </div>
          )}

          <p className="text-sm text-foreground/80 line-clamp-3">{item.description}</p>
        </CardContent>
      )}
      <CardFooter>
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex flex-col">
            <span className="text-sm text-foreground/80">{dateOnly}</span>
            {item.location_name && (
              <span className="text-xs text-muted-foreground mt-0.5">{item.location_name}</span>
            )}
          </div>
          {item.source ? (
            <div className="relative">
              <Link
                href={item.source}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2"
                onMouseEnter={() => setShowPopup(true)}
                onMouseLeave={() => setShowPopup(false)}
                onFocus={() => setShowPopup(true)}
                onBlur={() => setShowPopup(false)}
                onClick={() => setShowPopup((s) => !s)}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="sr-only">Open source</span>
              </Link>

              {/* Hover/focus popup preview */}
              {showPopup && (
                <div className="absolute right-0 top-6 z-50 w-80">
                  <LinkPreview url={item.source} />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </CardFooter>
    </article>
  );
}

export default NewsCard;
