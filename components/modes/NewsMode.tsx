import React, { useMemo, useState, useEffect } from "react";
import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { NewsList, type NewsItem, type AreaInfo } from "./news_component";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useMapSelection } from "@/lib/hooks";
import { useMarkerNew } from "@/lib/contexts/MarkerNewContext";
import { extractDistrict } from "@/lib/utils/districtValidation";

export function NewsMode() {
  // Get search selection context for district extraction
  const { results, selectedIndex } = useMapSelection();
  const { setItems: setMarkerItems } = useMarkerNew();

  // Client-side state for news items comes only from the backend now.
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        // Extract district from the selected location
        if (!results || selectedIndex === null) {
          return;
        }
        let districtParam = "";
        if (results && selectedIndex !== null) {
          const displayName = results[selectedIndex]?.display_name;
          if (displayName) {
            districtParam = extractDistrict(displayName);
          }
        }

        // Build the API URL with district parameter if available
        let apiUrl = "/api/news";
        if (districtParam) {
          apiUrl += `?district=${encodeURIComponent(districtParam)}`;
        }

        const res = await fetch(apiUrl);
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          // Map backend rows to the frontend `NewsItem` shape. The backend may return `lat`/`lon` as
          // top-level columns rather than a nested `location` object.
          const mapped: NewsItem[] = data.map((row: any) => {
            const latRaw = row.lat ?? row.latitude ?? null;
            const lonRaw = row.lon ?? row.longitude ?? null;

            // Normalize nested Location / location object if provided by backend
            const rawNested = row.location ?? row.Location ?? null;
            let location: { lat: number; lon: number } | null = null;

            if (rawNested) {
              const nestedLat =
                rawNested.lat ??
                rawNested.latitude ??
                rawNested.Lat ??
                rawNested.Latitude ??
                null;
              const nestedLon =
                rawNested.lon ??
                rawNested.longitude ??
                rawNested.Lon ??
                rawNested.Longitude ??
                null;
              if (nestedLat != null || nestedLon != null) {
                location = { lat: Number(nestedLat), lon: Number(nestedLon) };
              }
            } else if (latRaw != null || lonRaw != null) {
              location = { lat: Number(latRaw), lon: Number(lonRaw) };
            }

            const categories = Array.isArray(row.category)
              ? row.category
              : row.category
              ? [row.category]
              : undefined;

            // Normalize severity to lowercase string (e.g. 'critical', 'warning', 'info', 'normal')
            const rawSeverity =
              (row.severity as any) ?? (row.status as any) ?? null;
            const severity = rawSeverity
              ? String(rawSeverity).toLowerCase()
              : undefined;

            return {
              id: String(row.id ?? row._id ?? ""),
              title: row.title ?? row.name ?? "",
              description: row.description ?? row.summary ?? undefined,
              source: row.source ?? row.url ?? undefined,
              date: row.date ?? row.created_at ?? undefined,
              severity,
              category: categories,
              location,
              district:
                row.district ??
                row.District ??
                row.location_district ??
                undefined,
              location_name: row.location_name ?? row.locationName ?? undefined,
            } as NewsItem;
          });

          setNewsItems(mapped);

          // Also set the marker items with the news data
          const markerItems = mapped.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            source: item.source,
            date: item.date,
            severity:
              item.severity === "critical" ? "danger" : (item.severity as any),
            category: item.category,
            location: item.location,
            location_name: item.location_name,
          }));
          setMarkerItems(markerItems);

          // populate areaInfo from backend district endpoint when available
          // Use the district extracted from the selected location if available, otherwise use the first district from the mapped data
          let districtForInfo = "";
          if (results && selectedIndex !== null) {
            const displayName = results[selectedIndex]?.display_name;
            if (displayName) {
              districtForInfo = extractDistrict(displayName);
            }
          }
          if (!districtForInfo) {
            districtForInfo = mapped.find((m) => !!m.district)?.district || "";
          }

          if (districtForInfo) {
            try {
              const dRes = await fetch(
                `/api/districts/${encodeURIComponent(districtForInfo)}`
              );
              if (dRes.ok) {
                const dJson = await dRes.json();
                // Use raw backend risk_level string as area status and keep it unchanged.
                const rawStatus =
                  dJson.risk_level ??
                  dJson.riskLevel ??
                  dJson.risk ??
                  undefined;

                // update area info with district/province/country and raw status from backend
                setAreaInfo((prev) => ({
                  ...prev,
                  status: rawStatus,
                  district: dJson.district ?? districtForInfo,
                  province: dJson.province ?? prev.province,
                  country: dJson.country ?? prev.country,
                }));
              } else {
                setAreaInfo((prev) => ({ ...prev, district: districtForInfo }));
              }
            } catch (err) {
              console.error("Failed to fetch district info:", err);
              setAreaInfo((prev) => ({ ...prev, district: districtForInfo }));
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Failed to fetch news:", msg);
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNews();
    return () => {
      mounted = false;
    };
  }, [results, selectedIndex]);

  // Delete a news item by id (calls backend and updates local state)
  const handleDelete = async (id: string) => {
    if (!id) return;
    const ok = confirm("Delete this news item? This action cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetch(`/api/news/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.status === 204 || res.ok) {
        // remove from state
        setNewsItems((prev) => prev.filter((n) => n.id !== id));
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error ?? body?.message ?? `HTTP ${res.status}`;
        alert("Failed to delete news: " + msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("Delete request failed: " + msg);
    }
  };

  const [areaInfo, setAreaInfo] = useState<AreaInfo>({
    status: "warning",
    district: undefined,
    province: undefined,
    country: undefined,
    historicalEvents: [],
  });
  // Filter options for the checklist
  const filterOptions = ["Accidents", "Violence", "Caution", "Natural Hazard"];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);

  const toggleTag = (tag: string, checked: boolean) => {
    setSelectedTags((prev) => {
      if (checked) {
        if (prev.includes(tag)) return prev;
        return [...prev, tag];
      }
      return prev.filter((t) => t !== tag);
    });
  };

  const clearFilters = () => setSelectedTags([]);

  const filteredItems = useMemo(() => {
    let results = newsItems.slice();

    // filter by tags if any selected
    if (selectedTags && selectedTags.length > 0) {
      results = results.filter(
        (it) =>
          !!it.category && it.category.some((t) => selectedTags.includes(t))
      );
    }

    // filter by search term (title)
    if (searchTerm && searchTerm.trim() !== "") {
      const q = searchTerm.trim().toLowerCase();
      results = results.filter((it) =>
        (it.title || "").toLowerCase().includes(q)
      );
    }

    // filter by date range if provided
    if (
      (fromDate && fromDate.trim() !== "") ||
      (toDate && toDate.trim() !== "")
    ) {
      let start: Date | null = null;
      let end: Date | null = null;
      if (fromDate) {
        start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
      }
      if (toDate) {
        end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
      }

      results = results.filter((it) => {
        if (!it.date) return false;
        const d = new Date(it.date);
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      });
    }

    return results;
  }, [newsItems, selectedTags, searchTerm, fromDate, toDate]);

  // Show loading UI while fetching. Only show empty state when not loading and no items returned.
  if (loading) {
    return <EmptyState icon={Newspaper} message="Loading news..." />;
  }

  if (!loading && newsItems.length === 0) {
    return (
      <EmptyState icon={Newspaper} message="No news updates at the moment" />
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters checklist */}
      <div className="flex items-start justify-between flex-wrap">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {filterOptions.map((opt) => (
            <label
              key={opt}
              className="inline-flex items-center gap-2 whitespace-normal"
            >
              <Checkbox
                checked={selectedTags.includes(opt)}
                onCheckedChange={(v) => toggleTag(opt, !!v)}
              />
              <Label className="text-xs">{opt}</Label>
            </label>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Search bar between filters and area card */}
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search news by title"
          className="flex-1 text-sm border rounded-lg px-2 py-1"
        />
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
            Clear
          </Button>
        )}
      </div>

      <NewsList
        items={filteredItems}
        area={areaInfo}
        fromDate={fromDate}
        toDate={toDate}
        onDateRangeChange={(f, t) => {
          setFromDate(f);
          setToDate(t);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
