"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import type { NewsItem } from "./NewsCard";
import useLinkPreview from "./useLinkPreview";

interface NewsModalProps {
  open: boolean;
  onClose: () => void;
  item: NewsItem | null;
  previewImage?: string | null;
}

export function NewsModal({ open, onClose, item, previewImage }: NewsModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Hook (always called)
  const { previewImage: fetched } = useLinkPreview(!previewImage ? item?.source : undefined);

  if (!open || !item) return null;

  const imgSrc = previewImage || fetched || (item as any).image || "/images/news-fallback.png";

  const dateStr = item.date
    ? new Date(item.date).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  const locationStr = item.location_name
    ? item.location_name
    : (item.location
        ? `${item.location.lat.toFixed(5)}, ${item.location.lon.toFixed(5)}`
        : "");

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* semi-transparent overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden
      />
      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title ?? "News details"}
        className="relative w-[min(900px,90%)] bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* image */}
        <div className="h-44 bg-gray-100 dark:bg-gray-900 rounded-md mb-4 flex items-center justify-center overflow-hidden">
          <img
            src={imgSrc}
            alt={item.title ?? "image"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/news-fallback.png"; }}
          />
        </div>

        {/* title */}
        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

        {/* description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {item.description ?? "No description"}
        </p>

        {/* date / location */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div>{dateStr}</div>
          <div className="text-right truncate max-w-[50%]">{locationStr}</div>
        </div>

        {/* source link */}
        {item.source && (
          <div className="text-sm">
            <a
              href={item.source}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {item.source}
            </a>
          </div>
        )}

        {/* close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white dark:bg-gray-700 rounded-full w-9 h-9 flex items-center justify-center shadow"
          type="button"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default NewsModal;