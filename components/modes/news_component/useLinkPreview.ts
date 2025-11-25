import React from "react";

export default function useLinkPreview(url?: string) {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const fetchPreview = async () => {
      if (!url) {
        setPreviewImage(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (!res.ok) {
          setPreviewImage(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setPreviewImage(data?.image ?? null);
      } catch {
        if (!cancelled) setPreviewImage(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { previewImage, loading };
}