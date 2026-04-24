import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { researches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(researches)
    .where(eq(researches.userId, userId))
    .orderBy(desc(researches.date))
    .limit(20);

  const formatted = rows.map((r) => ({
    ...r,
    date: r.date instanceof Date ? r.date.toISOString() : r.date,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, keywords, regionCode, table1, table2 } = body;

  const inserted = await db
    .insert(researches)
    .values({
      id,
      userId,
      keywords,
      regionCode,
      table1,
      table2,
    })
    .returning();

  return NextResponse.json(inserted[0]);
}
