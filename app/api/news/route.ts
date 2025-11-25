// app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const InputSchema = z.object({
  title: z.string().min(1),
  severity_id: z.number().int().nullable(),
  location: z.object({
    name: z.string().min(1),
    lat: z.union([z.number(), z.string()]),
    lon: z.union([z.number(), z.string()]),
    address_district: z.string().min(1),
  }),
  news_source: z.string().url().nullable(),
  news_date: z.string().date(),
  category: z.string().optional(),
  description: z.string().nullable(),
  recommended_action: z.string().nullable(),
  status: z.enum(["Private", "Published", "Rejected"]).default("Private"),
  owner: z.string().optional().nullable(),
});

const BodySchema = z.object({
  title: z.string().min(1),
  district: z.string().min(1),
  severity_id: z.number().int().optional(),
  category_id: z.number().int().optional(),
  description: z.string().nullable(),
  location_name: z.string().min(1),
  date: z.string().datetime(),           // จะส่ง ISO string มา
  source: z.string().url().nullable(),   // ถ้าอยากให้ไม่ต้องเป็น URL เป๊ะ เปลี่ยนเป็น z.string().nullable()
  recommended_action: z.string().nullable(),
  media_url: z.string().url().nullable(),
  status: z.enum(["Private", "Published", "Rejected"]).default("Private"),
  lat: z.string(),
  lon: z.string(),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = InputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  
  const data = parsed.data;
  const district = data.location?.address_district.split(",")[0].replace(/\s*District$/i, "").trim();

  const addressDistrict = data.location?.address_district;
  if (!addressDistrict) {
    return NextResponse.json({ error: "Missing address_district" }, { status: 400 });
  }
  
  const district = (String(addressDistrict).split(",")[0] ?? "").replace(/\s*District$/i, "").trim();
  
  const { data: zone, error: zoneErr } = await supabase
    .from("district_zone")
    .select("district")
    .eq("district", district)
    .maybeSingle();

  if (!zone || zoneErr) {
    return NextResponse.json({ error: "Invalid district" }, { status: 400 });
  }

  // เช็คว่า category มีใน category_score  
  const { data: categoryId, error: categoryErr } = await supabase
    .from("category_score")
    .select("id")
    .eq("category", parsed.data.category)
    .single();

  if (!categoryId || categoryErr) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  const { error } = await supabase.from("news").insert({
    title: data.title,
    district: district,
    severity_id: data.severity_id || null,
    category_id: categoryId.id,
    description: data.description,
    location_name: data.location.name,
    date: data.news_date,                       // ✅ ชื่อตรงกับ DDL
    source: data.news_source,                   // ✅ ชื่อตรงกับ DDL
    recommended_action: data.recommended_action,
    media_url: null,
    status: data.status,
    lat: data.location.lat,
    lon: data.location.lon,
    submitted_by_id: null,                 // ไว้ผูกกับ auth.users ทีหลัง
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, message: "Created successfully" },
    { status: 201 }
  );
}

// GET /api/news?district=Thung%20Khru&status=Published
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const district = searchParams.get("district"); // optional
  const status = searchParams.get("status");     // optional: "Private" | "Published" | "Rejected"

  let query = supabase
    .from("news")
    .select("*")
    .order("date", { ascending: false });

  if (district) {
    query = query.eq("district", district);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching news list:", error.message);
    return NextResponse.json(
      { error: "Unable to fetch news list." },
      { status: 500 }
    );
  }

  // 200 OK: คืน array ของ news ทั้งหมดตาม filter
  return NextResponse.json(data, { status: 200 });
}
