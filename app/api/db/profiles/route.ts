import { NextRequest, NextResponse } from "next/server";
import { getChannelProfiles, createChannelProfile } from "@/db/queries";

export async function GET() {
  try {
    const profiles = await getChannelProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, is_personal_brand, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (typeof is_personal_brand !== "boolean") {
      return NextResponse.json({ error: "is_personal_brand must be a boolean" }, { status: 400 });
    }
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const profile = await createChannelProfile({
      name: name.trim(),
      isPersonalBrand: is_personal_brand,
      description: description.trim(),
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
