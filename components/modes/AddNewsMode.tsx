"use client";
import React, { useMemo } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared";
import { useMapView } from "@/lib/contexts";
import type { NominatimResult } from "@/types/map";

const REPORT_FIELDS = [
  {
    id: "report-title",
    label: "Title",
    placeholder: "Brief description",
    required: true,
  },
  {
    id: "report-location",
    label: "Location",
    placeholder: "Where is this happening?",
    type: "location" as const,
    required: true,
  },
  {
    id: "report-date",
    label: "Date",
    placeholder: "When did this happen?",
    type: "date" as const,
    required: true,
  },
  {
    id: "report-source",
    label: "Source",
    placeholder: "Where did you find this information?",
    required: true,
  },
  {
    id: "report-description",
    label: "Description",
    placeholder: "Provide details...",
    type: "textarea" as const,
    required: false,
  },
] as const;

// แยก district จากผล reverse geocoding
function extractDistrict(result: NominatimResult): string | null {
  const { address, display_name } = result;

  // ใช้ address ก่อน (ข้อมูลสะอาดกว่า)
  if (address?.city_district) {
    return address.city_district.replace(/ (District|Subdistrict)$/i, "").trim();
  }
  if (address?.district) {
    return address.district.replace(/ (District|Subdistrict)$/i, "").trim();
  }
  if (address?.suburb) {
    return address.suburb.replace(/ (District|Subdistrict)$/i, "").trim();
  }
  if (address?.county) {
    return address.county.replace(/ (District|Subdistrict)$/i, "").trim();
  }

  // fallback: แงะจาก display_name แบบ "Rat Burana Subdistrict, Rat Burana District, Bangkok, 10140, Thailand"
  const parts = display_name.split(",");
  if (parts.length >= 2) {
    return parts[1].trim().replace(/ (District|Subdistrict)$/i, "");
  }

  return null;
}

export function AddNewsMode() {
  const { selectedLocation } = useMapView(); // ได้ NominatimResult จากการคลิกบนแผนที่

  // เตรียมข้อมูลตำแหน่งที่แตกแล้ว ไว้ใช้ทั้งแสดงผลและยิง API
  const derivedLocation = useMemo(() => {
    if (!selectedLocation) return null;

    const district = extractDistrict(selectedLocation) ?? "";

    return {
      location_name: selectedLocation.display_name, // ใช้เต็ม ๆ เป็นชื่อสถานที่
      district,
      lat: selectedLocation.lat, // เป็น string อยู่แล้ว
      lon: selectedLocation.lon,
    };
  }, [selectedLocation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;  // 👈 เก็บ reference ฟอร์มไว้ก่อน

    if (!derivedLocation) {
      alert("กรุณาเลือกตำแหน่งจากแผนที่ก่อนส่งรายงาน");
      return;
    }
    if (!derivedLocation.district) {
      alert(
        "ระบบหา district จากตำแหน่งนี้ไม่เจอ ลองขยับหมุดใหม่ หรือแมป district ให้ตรงกับฐานข้อมูล district_zone"
      );
      return;
    }

    const formData = new FormData(form);
    const title = (formData.get("report-title") as string) || "";
    const date = (formData.get("report-date") as string) || "";
    const source = (formData.get("report-source") as string) || "";
    const description =
      (formData.get("report-description") as string) || "";

    if (!title || !date || !source) {
      alert("กรุณากรอก Title / Date / Source ให้ครบ");
      return;
    }

    const payload = {
      title,
      district: derivedLocation.district,
      severity_id: 2,
      category_id: 3,
      description,
      location_name: derivedLocation.location_name,
      date: new Date(date).toISOString(),
      source,
      recommended_action: null,
      media_url: null,
      status: "Private",
      lat: derivedLocation.lat,
      lon: derivedLocation.lon,
    };

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let result: any = null;
      try {
        result = await res.json();
      } catch (e) {
        console.warn("Response is not valid JSON or empty", e);
      }

      if (!res.ok) {
        console.error("API error:", res.status, result);
        alert(result?.error || "เกิดข้อผิดพลาดในการสร้างข่าว");
        return;
      }

      console.log("Create news response:", res.status, result);
      alert("ส่งรายงานสำเร็จ");

      form.reset();   // 👈 ใช้ตัวแปร form ที่ไม่หายแล้ว
    } catch (err) {
      console.error("Network or fetch error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };


  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {REPORT_FIELDS.map((field) => (
        <FormField key={field.id} {...field} />
      ))}

      {/* แสดงสรุปตำแหน่งที่เลือกจากแผนที่ */}
      <div className="p-2.5 rounded-xl bg-foreground/5 border border-border/10 text-xs text-foreground/70 space-y-1">
        {derivedLocation ? (
          <>
            <div>
              <span className="font-semibold">Selected place: </span>
              {derivedLocation.location_name}
            </div>
            <div>
              <span className="font-semibold">District: </span>
              {derivedLocation.district || "(ไม่พบ district จากข้อมูล map)"}
            </div>
            <div>
              <span className="font-semibold">Lat/Lon: </span>
              {derivedLocation.lat}, {derivedLocation.lon}
            </div>
          </>
        ) : (
          <p>
            ยังไม่เลือกตำแหน่งจากแผนที่ — ใช้โหมด “Select location from map”
            ก่อนส่งฟอร์ม
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full rounded-xl h-10 bg-primary hover:bg-primary/90 transition-all shadow-md"
      >
        <Send className="w-4 h-4 mr-2" strokeWidth={2} />
        Submit Report
      </Button>

      <div className="p-2.5 rounded-xl bg-foreground/5 border border-border/10">
        <p className="text-xs text-foreground/60">
          Reports are reviewed and shared with the community.
        </p>
      </div>
    </form>
  );
}
