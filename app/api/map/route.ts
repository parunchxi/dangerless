import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const limit = searchParams.get("limit") || "5";

    // Determine which type of geocoding to use
    if (lat && lon) {
      // Reverse geocoding
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(
        lon
      )}&accept-language=en&addressdetails=1`;

      const res = await fetch(nominatimUrl, {
        headers: {
          "User-Agent":
            "dangerless/1.0 (+https://your-site.example; contact@your-domain.example)",
        },
      });

      const data = await res.json();
      console.log("Nominatim reverse geocoding response:", data);

      return NextResponse.json(data);
    } else if (q) {
      // Forward geocoding
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&addressdetails=1&limit=${encodeURIComponent(
        limit
      )}&accept-language=en&polygon_geojson=1`;

      const res = await fetch(nominatimUrl, {
        headers: {
          "User-Agent":
            "dangerless/1.0 (+https://your-site.example; contact@your-domain.example)",
        },
      });

      const data = await res.text();
      return new Response(data, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("content-type") || "application/json",
        },
      });
    } else {
      return NextResponse.json(
        { error: "missing required parameters" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Nominatim proxy error:", err);
    return NextResponse.json({ error: "proxy_failed" }, { status: 500 });
  }
}
