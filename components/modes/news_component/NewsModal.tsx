"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import type { NewsItem } from "./NewsCard";
import useLinkPreview from "./useLinkPreview";

export function NewsModal({ open, onClose, item }: { open: boolean; onClose: () => void; item: NewsItem | null }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // appeler le hook toujours (même si item possiblement null) — respecte les règles des Hooks
  const { previewImage } = useLinkPreview(item?.source);

  if (!open || !item) return null;

  const imgSrc = previewImage ?? (item as any).image ?? "/images/news-fallback.png";

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 dark:bg-black/70"
        onClick={onClose}
        aria-hidden
      />

      {/* modal box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title ?? "News details"}
        className="relative w-[min(900px,90%)] bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 text-slate-900 dark:text-slate-100"
      >
        {/* image area */}
        <div className="h-44 bg-gray-100 dark:bg-slate-700 rounded-md mb-4 flex items-center justify-center overflow-hidden">
          <img
            src={imgSrc}
            alt={item.title ?? "image"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/news-fallback.png"; }}
          />
        </div>

        <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">{item.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{item.description ?? "Pas de description"}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>{item.date ?? ""}</div>
          <div>{item.location_name ?? (item.location ? `${item.location.lat.toFixed(5)}, ${item.location.lon.toFixed(5)}` : "")}</div>
        </div>

        <div className="mt-4 text-sm">
          {item.source && (
            <a
              href={item.source}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Voir la source
            </a>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white dark:bg-slate-600 rounded-full w-9 h-9 flex items-center justify-center shadow"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

export default NewsModal;