import { NextRequest, NextResponse } from "next/server";
import { getSavedLists, createSavedList } from "@/db/queries";

export async function GET() {
  try {
    const lists = await getSavedLists();
    return NextResponse.json(lists);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, videos } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!Array.isArray(videos)) {
      return NextResponse.json({ error: "Videos must be an array" }, { status: 400 });
    }

    const list = await createSavedList(name.trim(), videos);
    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 });
  }
}
