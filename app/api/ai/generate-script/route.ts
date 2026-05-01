import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { outlineToScript } from "@/lib/openai";
import {
  createScript,
  getOutlineById,
  getChannelProfileById,
} from "@/db/queries";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { outline_id, channel_profile_id, call_to_action } = body;

    if (!outline_id || typeof outline_id !== "string" || outline_id.trim().length === 0) {
      return NextResponse.json({ error: "outline_id is required" }, { status: 400 });
    }
    if (
      !channel_profile_id ||
      typeof channel_profile_id !== "string" ||
      channel_profile_id.trim().length === 0
    ) {
      return NextResponse.json({ error: "channel_profile_id is required" }, { status: 400 });
    }
    if (
      !call_to_action ||
      typeof call_to_action !== "string" ||
      call_to_action.trim().length === 0
    ) {
      return NextResponse.json({ error: "call_to_action is required" }, { status: 400 });
    }

    // Load outline and verify ownership
    const outline = await getOutlineById(outline_id.trim());
    if (!outline || outline.userId !== userId) {
      return NextResponse.json({ error: "Outline not found" }, { status: 403 });
    }

    // Load profile and verify ownership
    const profile = await getChannelProfileById(channel_profile_id.trim());
    if (!profile || profile.userId !== userId) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Generate script
    const content = await outlineToScript({
      outline: outline.content,
      channelName: profile.name,
      isPersonalBrand: profile.isPersonalBrand,
      channelDescription: profile.description,
      callToAction: call_to_action.trim(),
    });

    // Save to DB
    const script = await createScript({
      outlineId: outline_id.trim(),
      channelProfileId: channel_profile_id.trim(),
      title: outline.title,
      content,
      callToAction: call_to_action.trim(),
    });

    return NextResponse.json({ script });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Не удалось сгенерировать сценарий" },
      { status: 500 }
    );
  }
}
