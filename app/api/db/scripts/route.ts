import { NextResponse } from "next/server";
import { getScripts } from "@/db/queries";

export async function GET() {
  try {
    const scripts = await getScripts();
    return NextResponse.json(scripts);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch scripts" }, { status: 500 });
  }
}
