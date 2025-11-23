import React, { useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { NewsList, type NewsItem, type AreaInfo } from "./news_component";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function NewsMode({ onItemClick }: { onItemClick?: (item: NewsItem) => void }) {
  // Example placeholder items; replace with real data fetching
  const newsItems: NewsItem[] = [
    {
      id: "1",
      title: "Community safety patrol launched",
      description: "Local volunteers have started a nightly safety patrol in the downtown area.",
      // `source` is the article URL now
      source: "https://gametora.com/umamusume/characters/101301-mejiro-mcqueen",
      date: new Date().toISOString(),
      severity: "critical",
      category: ["Caution"],
      location: { lat: 13.7437, lon: 100.5321 },
      location_name: "Downtown Patrol HQ",
    },
    {
      id: "2",
      title: "New street lighting installed",
      description: "Bright LED streetlights is currently being installed on Elm Street to improve visibility.",
      source: "https://youtu.be/J7FqiKJmwEI?si=shc-tBEp4W3l8gZW",
      date: new Date().toISOString(),
      severity: "info",
      category: ["Caution"],
      location: { lat: 13.7304, lon: 100.5206 },
      location_name: "Elm Street",
    },
    {
      id: "3",
      title: "Islamic Center Renovation Completed",
      description: "Renovation of the Islamic Center has been under construction, will featuring new facilities and improved accessibility. Please be careful to the surrounding area.",
      source: "https://youtu.be/-fMkyL1q0eU?si=vrC-94qcXpol8izR",
      date: new Date().toISOString(),
      severity: "info",
      category: ["Caution"],
      location: { lat: 13.7399, lon: 100.5250 },
      location_name: "Islamic Center",
    },
    {
      id: "4",
      title: "Tornado Warning Issued",
      description: "A tornado warning has been issued for the area. Residents are advised to take shelter.",
      source: "https://youtu.be/aacHWoB7cmY?si=j30AnKaC7SNpQkPF",
      date: new Date().toISOString(),
      severity: "warning",
      category: ["Natural Hazard"],
      location: { lat: 13.8050, lon: 100.5600 },
      location_name: "Northern District",
    },
    {
      id: "5",
      title: "Car crash on Highway 50",
      description: "Caution advised due to a multi-vehicle accident on Highway 50 causing delays.",
      source: "https://youtu.be/pDOkKGbFZSY?si=YQOLb9G6WRYMESs7",
      date: new Date().toISOString(),
      severity: "warning",
      category: ["Accidents"],
      // mock location (Bangkok example)
      location: { lat: 13.736717, lon: 100.523186 },
      location_name: "Highway 50, Exit 7",
    }
  ];

  const areaInfo: AreaInfo = {
    status: "warning",
    subDistrict: "Old Town",
    district: "Central",
    province: "Bangkok",
    country: "Thailand",
    historicalEvents: [
      {
        title: "Annual Night Market",
        startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        endDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 29).toISOString(),
      },
      {
        title: "Street Festival",
        startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        endDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 9).toISOString(),
      },
    ],
  };
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
      results = results.filter((it) => !!it.category && it.category.some((t) => selectedTags.includes(t)));
    }

    // filter by search term (title)
    if (searchTerm && searchTerm.trim() !== "") {
      const q = searchTerm.trim().toLowerCase();
      results = results.filter((it) => (it.title || "").toLowerCase().includes(q));
    }

    // filter by date range if provided
    if ((fromDate && fromDate.trim() !== "") || (toDate && toDate.trim() !== "")) {
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

  if (newsItems.length === 0) {
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
            <label key={opt} className="inline-flex items-center gap-2 whitespace-normal">
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
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>Clear</Button>
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
        onItemClick={onItemClick}
      />
    </div>
  );
}
