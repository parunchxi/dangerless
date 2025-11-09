import { NextResponse } from "next/server";
import { getLinkPreview } from "link-preview-js";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
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
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}
