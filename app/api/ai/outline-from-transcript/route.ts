import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTranscript } from "@/lib/transcript";
import { transcriptToOutline } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { videoId } = body;

    if (!videoId || typeof videoId !== "string" || videoId.trim().length === 0) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const transcript = await getTranscript(videoId.trim());
    const outline = await transcriptToOutline(transcript);

    return NextResponse.json({ outline });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Транскрипция недоступна") ||
        error.message.includes("subtitles") ||
        error.message.includes("disabled")
      ) {
        return NextResponse.json(
          { error: "Транскрипция недоступна для этого видео" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { error: "Не удалось создать фабулу из транскрипции" },
      { status: 500 }
    );
  }
}
