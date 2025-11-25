// app/api/news/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const UpdateNewsSchema = z.object({
  title: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  severity_id: z.number().int().optional(),
  category_id: z.number().int().optional(),
  description: z.string().nullable().optional(),
  location_name: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  source: z.string().url().nullable().optional(),
  recommended_action: z.string().nullable().optional(),
  media_url: z.string().url().nullable().optional(),
  status: z.enum(["Private", "Published", "Rejected"]).optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

// helper GET / PUT / DELETE
async function getNewsById(id: string) {
  return supabase.from("news").select("*").eq("id", id).maybeSingle();
}

/* ------------ GET /api/news/[id] ------------ */
/* ------------ GET /api/news/[id] ------------ */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ⬇ ต้อง await ก่อน ถึงจะเอา id มาใช้ได้
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing id in URL" },
      { status: 400 }
    );
  }

  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching news by id:", error.message);
    return NextResponse.json(
      { error: "Unable to fetch news." },
      { status: 500 }
    );
  }

  if (!news) {
    return NextResponse.json(
      { error: "News not found." },
      { status: 404 }
    );
  }

  const [{ data: categoryRow }, { data: severityRow }] = await Promise.all([
    supabase
      .from("category_score")
      .select("category")
      .eq("id", news.category_id)
      .single(),
    supabase
      .from("news_severity")
      .select("severity")
      .eq("id", news.severity_id)
      .single(),
  ]);

  const result = {
    ...news,
    category: categoryRow?.category ?? null,
    severity: severityRow?.severity ?? null,
  };

  return NextResponse.json(result, { status: 200 });
}

/* ------------ PUT /api/news/[id] ------------ */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing id in URL" },
      { status: 400 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = UpdateNewsSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updateData = parsed.data;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  const { data: existing, error: findErr } = await getNewsById(id);
  if (findErr) {
    console.error("Error fetching news:", findErr.message);
    return NextResponse.json(
      { error: "Database error while fetching news" },
      { status: 500 }
    );
  }
  if (!existing) {
    return NextResponse.json(
      { error: "News ID not found" },
      { status: 404 }
    );
  }

  if (updateData.district) {
    const { data: dz, error: dzErr } = await supabase
      .from("district_zone")
      .select("district")
      .eq("district", updateData.district)
      .maybeSingle();

    if (dzErr) {
      console.error("Error checking district_zone:", dzErr.message);
      return NextResponse.json(
        { error: "Database error while checking district" },
        { status: 500 }
      );
    }

    if (!dz) {
      return NextResponse.json(
        { error: "Invalid district (not found in district_zone)" },
        { status: 400 }
      );
    }
  }

  const { data, error: updateErr } = await supabase
    .from("news")
    .update(updateData)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (updateErr) {
    console.error("Error updating news:", updateErr.message);
    return NextResponse.json(
      { error: "Database error while updating news" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, message: "News updated.", data },
    { status: 200 }
  );
}

/* ------------ DELETE /api/news/[id] ------------ */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing id in URL" },
      { status: 400 }
    );
  }

  const { data: existing, error: findErr } = await getNewsById(id);
  if (findErr) {
    console.error("Error fetching news:", findErr.message);
    return NextResponse.json(
      { error: "Database error while fetching news" },
      { status: 500 }
    );
  }

  if (!existing) {
    return NextResponse.json(
      { error: "News not found." },
      { status: 404 }
    );
  }

  const { error: delErr } = await supabase
    .from("news")
    .delete()
    .eq("id", id);

  if (delErr) {
    console.error("Error deleting news:", delErr.message);
    return NextResponse.json(
      { error: "Delete operation failed." },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}