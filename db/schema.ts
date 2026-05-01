import { pgTable, text, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

export const researches = pgTable("researches", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  keywords: text("keywords").array().notNull(),
  regionCode: text("region_code").notNull(),
  table1: jsonb("table1").notNull().$type<object[]>(),
  table2: jsonb("table2").notNull().$type<object[]>(),
});

export const savedLists = pgTable("saved_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  videos: jsonb("videos").notNull().$type<object[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const channelProfiles = pgTable("channel_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  isPersonalBrand: boolean("is_personal_brand").notNull().default(true),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const outlines = pgTable("outlines", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull(),
  sourceVideoId: text("source_video_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scripts = pgTable("scripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  outlineId: uuid("outline_id").references(() => outlines.id, { onDelete: "set null" }),
  channelProfileId: uuid("channel_profile_id").references(() => channelProfiles.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  callToAction: text("call_to_action"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Research = typeof researches.$inferSelect;
export type NewResearch = typeof researches.$inferInsert;
export type SavedList = typeof savedLists.$inferSelect;
export type NewSavedList = typeof savedLists.$inferInsert;
export type ChannelProfile = typeof channelProfiles.$inferSelect;
export type NewChannelProfile = typeof channelProfiles.$inferInsert;
export type Outline = typeof outlines.$inferSelect;
export type NewOutline = typeof outlines.$inferInsert;
export type Script = typeof scripts.$inferSelect;
export type NewScript = typeof scripts.$inferInsert;
