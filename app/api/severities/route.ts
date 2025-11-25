import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("news_severity")
      .select("id, severity")
      .order("severity", { ascending: true });

    if (error) {
      console.error("Error fetching severities:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch severities" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error("Severities endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
