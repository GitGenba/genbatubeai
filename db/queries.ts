import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./index";
import { savedLists, channelProfiles, outlines, scripts } from "./schema";
import type {
  SavedList,
  ChannelProfile,
  Outline,
  Script,
} from "./schema";
import type {
  VideoResult,
  CreateChannelProfileInput,
  CreateOutlineInput,
  CreateScriptInput,
} from "@/types/index";

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// ─── Saved Lists ────────────────────────────────────────────────────────────

export async function getSavedLists(): Promise<SavedList[]> {
  try {
    const userId = await getUserId();
    return await db
      .select()
      .from(savedLists)
      .where(eq(savedLists.userId, userId))
      .orderBy(desc(savedLists.createdAt));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to fetch saved lists");
  }
}

export async function createSavedList(
  name: string,
  videos: VideoResult[]
): Promise<SavedList> {
  try {
    const userId = await getUserId();
    const [row] = await db
      .insert(savedLists)
      .values({ userId, name, videos })
      .returning();
    return row;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to create saved list");
  }
}

export async function deleteSavedList(id: string): Promise<void> {
  try {
    const userId = await getUserId();
    await db
      .delete(savedLists)
      .where(and(eq(savedLists.id, id), eq(savedLists.userId, userId)));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to delete saved list");
  }
}

// ─── Channel Profiles ────────────────────────────────────────────────────────

export async function getChannelProfiles(): Promise<ChannelProfile[]> {
  try {
    const userId = await getUserId();
    return await db
      .select()
      .from(channelProfiles)
      .where(eq(channelProfiles.userId, userId))
      .orderBy(desc(channelProfiles.createdAt));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to fetch channel profiles");
  }
}

export async function createChannelProfile(
  data: CreateChannelProfileInput
): Promise<ChannelProfile> {
  try {
    const userId = await getUserId();
    const [row] = await db
      .insert(channelProfiles)
      .values({
        userId,
        name: data.name,
        isPersonalBrand: data.isPersonalBrand,
        description: data.description,
      })
      .returning();
    return row;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to create channel profile");
  }
}

export async function updateChannelProfile(
  id: string,
  data: Partial<CreateChannelProfileInput>
): Promise<ChannelProfile> {
  try {
    const userId = await getUserId();
    const [row] = await db
      .update(channelProfiles)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.isPersonalBrand !== undefined && {
          isPersonalBrand: data.isPersonalBrand,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        updatedAt: new Date(),
      })
      .where(
        and(eq(channelProfiles.id, id), eq(channelProfiles.userId, userId))
      )
      .returning();
    return row;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to update channel profile");
  }
}

export async function deleteChannelProfile(id: string): Promise<void> {
  try {
    const userId = await getUserId();
    await db
      .delete(channelProfiles)
      .where(
        and(eq(channelProfiles.id, id), eq(channelProfiles.userId, userId))
      );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to delete channel profile");
  }
}

// ─── Outlines ────────────────────────────────────────────────────────────────

export async function getOutlines(): Promise<Outline[]> {
  try {
    const userId = await getUserId();
    return await db
      .select()
      .from(outlines)
      .where(eq(outlines.userId, userId))
      .orderBy(desc(outlines.updatedAt));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to fetch outlines");
  }
}

export async function createOutline(
  data: CreateOutlineInput
): Promise<Outline> {
  try {
    const userId = await getUserId();
    const [row] = await db
      .insert(outlines)
      .values({
        userId,
        title: data.title,
        content: data.content,
        sourceType: data.sourceType,
        sourceVideoId: data.sourceVideoId ?? null,
      })
      .returning();
    return row;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to create outline");
  }
}

export async function updateOutline(
  id: string,
  content: string,
  title?: string
): Promise<Outline> {
  try {
    const userId = await getUserId();
    const [row] = await db
      .update(outlines)
      .set({
        content,
        ...(title !== undefined && { title }),
        updatedAt: new Date(),
      })
      .where(and(eq(outlines.id, id), eq(outlines.userId, userId)))
      .returning();
    return row;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to update outline");
  }
}

export async function deleteOutline(id: string): Promise<void> {
  try {
    const userId = await getUserId();
    await db
      .delete(outlines)
      .where(and(eq(outlines.id, id), eq(outlines.userId, userId)));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to delete outline");
  }
}

// ─── Scripts ─────────────────────────────────────────────────────────────────

export async function getScripts(): Promise<Script[]> {
  try {
    const userId = await getUserId();
    return await db
      .select()
      .from(scripts)
      .where(eq(scripts.userId, userId))
      .orderBy(desc(scripts.createdAt));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to fetch scripts");
  }
}

export async function createScript(data: CreateScriptInput): Promise<Script> {
  try {
    const userId = await getUserId();
    const [row] = await db
      .insert(scripts)
      .values({
        userId,
        outlineId: data.outlineId,
        channelProfileId: data.channelProfileId,
        title: data.title,
        content: data.content,
        callToAction: data.callToAction,
      })
      .returning();
    return row;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to create script");
  }
}

export async function deleteScript(id: string): Promise<void> {
  try {
    const userId = await getUserId();
    await db
      .delete(scripts)
      .where(and(eq(scripts.id, id), eq(scripts.userId, userId)));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    throw new Error("Failed to delete script");
  }
}

// ─── Single record getters (for ownership checks) ────────────────────────────

export async function getOutlineById(id: string): Promise<Outline | null> {
  const [row] = await db.select().from(outlines).where(eq(outlines.id, id));
  return row ?? null;
}

export async function getChannelProfileById(id: string): Promise<ChannelProfile | null> {
  const [row] = await db
    .select()
    .from(channelProfiles)
    .where(eq(channelProfiles.id, id));
  return row ?? null;
}
