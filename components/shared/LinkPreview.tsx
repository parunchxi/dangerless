"use client";

import { useState, useEffect } from "react";

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface LinkPreviewProps {
  url: string;
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) return;

    const fetchPreview = async () => {
      setLoading(true);
      setError("");
      setPreview(null);

      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`
        );
        const data = await res.json();

        if (res.ok) {
          setPreview(data);
        } else {
          setError("Unable to fetch preview");
        }
      } catch {
        setError("Unable to fetch preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) return <p className="text-gray-500 text-sm px-2">Loading preview...</p>;
  if (error && url) return <p className="text-gray-500 text-sm px-2">{error}</p>;
  if (!preview) return null;

  return (
    <div className="border rounded p-4 max-w-lg w-full shadow-md flex flex-col gap-2">
      {preview.image && (
        <img
          src={preview.image}
          alt={preview.title}
          className="w-full h-48 object-cover rounded"
        />
      )}
      <h3 className="text-lg font-bold">{preview.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2 truncate">
        {preview.description}
      </p>
      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 text-sm truncate"
      >
        {preview.url}
      </a>
    </div>
  );
}
