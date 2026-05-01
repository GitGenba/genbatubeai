import { NextRequest, NextResponse } from "next/server";
import { updateChannelProfile, deleteChannelProfile } from "@/db/queries";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, is_personal_brand, description } = body;

    const profile = await updateChannelProfile(id, {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(is_personal_brand !== undefined && { isPersonalBrand: Boolean(is_personal_brand) }),
      ...(description !== undefined && { description: String(description).trim() }),
    });
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteChannelProfile(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
