import { NextRequest, NextResponse } from "next/server";
import { getOutlines, createOutline } from "@/db/queries";

export async function GET() {
  try {
    const outlines = await getOutlines();
    return NextResponse.json(outlines);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch outlines" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, source_type, source_video_id } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (!["manual", "video", "topic"].includes(source_type)) {
      return NextResponse.json({ error: "Invalid source_type" }, { status: 400 });
    }

    const outline = await createOutline({
      title: title.trim(),
      content: content.trim(),
      sourceType: source_type,
      sourceVideoId: source_video_id ?? undefined,
    });
    return NextResponse.json(outline, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create outline" }, { status: 500 });
  }
}
