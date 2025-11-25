import { NextResponse } from "next/server";
import { getLinkPreview } from "link-preview-js";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let parsed: URL | undefined;

  try {
    // Basic URL validation - only allow http(s) schemes
    try {
      parsed = new URL(url);
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (!/^(https?:)$/.test(parsed.protocol)) {
      return NextResponse.json({ error: "Only http/https URLs are supported" }, { status: 400 });
    }

    // Quick network probe with timeout to surface connectivity/SSL/host issues
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const probe = await fetch(url, {
        method: "GET",
        // some sites block unusual user agents; use a browser-like UA
        headers: { "User-Agent": "Mozilla/5.0 (compatible; dangerless-link-preview/1.0)" },
        signal: controller.signal,
        redirect: "follow",
      });

      // Non-2xx status codes can still be parsed by the previewer, but surface 4xx/5xx
      if (probe.status >= 400) {
        clearTimeout(timeout);
        return NextResponse.json({ error: `Upstream responded ${probe.status} ${probe.statusText}` }, { status: 502 });
      }
    } catch (probeErr) {
      clearTimeout(timeout);
      const msg = probeErr instanceof Error ? probeErr.message : String(probeErr);
      console.error("Link preview probe failed:", probeErr);
      // Return the probe error so callers know if it's a network/SSL/timeout problem
      return NextResponse.json({ error: `Network probe failed: ${msg}` }, { status: 502 });
    } finally {
      clearTimeout(timeout);
    }

    const data:any = await getLinkPreview(url);

    // Extract main data
    const preview = {
      title: data.title || "",
      description: data.description || "",
      image: Array.isArray(data.images) ? data.images[0] || "" : "",
      url: data.url || url,
    };

    return NextResponse.json(preview);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Link preview extraction failed:", err);

    // Try a lightweight HTML fetch fallback to extract <title>, meta description and og:image
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; dangerless-link-preview-fallback/1.0)' } });
      clearTimeout(timeout);

      if (res.ok) {
        const text = await res.text();

        const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
        const descMatch = text.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || text.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        const ogImageMatch = text.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i) || text.match(/<meta[^>]+name=["']image["'][^>]*content=["']([^"']*)["'][^>]*>/i);

        const fallbackPreview = {
          title: titleMatch?.[1]?.trim() ?? parsed?.host ?? url,
          description: descMatch?.[1]?.trim() ?? "",
          image: ogImageMatch?.[1]?.trim() ?? "",
          url: url,
          fallback: true,
          warning: message,
        };

        return NextResponse.json(fallbackPreview, { status: 200 });
      }
    } catch (fallbackErr) {
      console.error('Fallback HTML probe failed:', fallbackErr);
    }

    // Return the original error message from the preview library to help debugging
    return NextResponse.json(
      { error: message || "Failed to fetch preview", details: (err as any)?.stack || null },
      { status: 500 }
    );
  }
}
