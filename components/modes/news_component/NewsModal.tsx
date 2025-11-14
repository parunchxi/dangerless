"use client";

import React, { useEffect } from "react";

export function NewsModal({ open, onClose, item }: { open: boolean; onClose: () => void; item: NewsItem | null }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[min(900px,90%)] bg-white rounded-lg shadow-lg p-6">
        {/* image optionnelle si présente */}
        <div className="h-44 bg-gray-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
          {/* si vous avez un champ image, affichez-le, sinon placeholder */}
          { (item as any).image ? (
            <img src={(item as any).image} alt={item.title ?? "image"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm text-gray-400">No image</span>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{item.description ?? "Pas de description"}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>{item.date ?? ""}</div>
          <div>{item.location_name ?? (item.location ? `${item.location.lat.toFixed(5)}, ${item.location.lon.toFixed(5)}` : "")}</div>
        </div>

        <div className="mt-4 text-sm">
          {item.source && (
            <a href={item.source} target="_blank" rel="noreferrer" className="text-blue-600 underline">
              Voir la source
            </a>
          )}
        </div>

        <button onClick={onClose} aria-label="Close" className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white rounded-full w-9 h-9 flex items-center justify-center shadow">
          ✕
        </button>
      </div>
    </div>
  );
}