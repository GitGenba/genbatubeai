import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { topicToOutline } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { topic } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json({ error: "Тема не может быть пустой" }, { status: 400 });
    }
    if (topic.trim().length > 200) {
      return NextResponse.json(
        { error: "Тема не может быть длиннее 200 символов" },
        { status: 400 }
      );
    }

    const outline = await topicToOutline(topic.trim());
    return NextResponse.json({ outline });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Не удалось сгенерировать фабулу" },
      { status: 500 }
    );
  }
}
