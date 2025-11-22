// app/api/districts/[district]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

/**
 * GET /api/districts/{district}
 * Example : /api/districts/Thung%20Khru
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ district: string }> }
) {
  const { district } = await params;

  if (!district) {
    return NextResponse.json(
      { error: "Missing district in URL" },
      { status: 400 }
    );
  }

  // รองรับชื่อที่มี space แล้ว encode มา เช่น "Thung%20Khru"
  const decodedDistrict = decodeURIComponent(district);

  const { data, error } = await supabase
    .from("district_zone")
    .select("district, risk_level, risk_score, province, country")
    .eq("district", decodedDistrict)
    .maybeSingle();

  if (error) {
    console.error("Error fetching district risk:", error.message);
    return NextResponse.json(
      { error: "Unable to fetch district risk level." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "District not found." },
      { status: 404 }
    );
  }

  // 200 OK
  return NextResponse.json(data, { status: 200 });
}
