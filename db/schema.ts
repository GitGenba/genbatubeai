import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const researches = pgTable("researches", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  keywords: text("keywords").array().notNull(),
  regionCode: text("region_code").notNull(),
  table1: jsonb("table1").notNull().$type<object[]>(),
  table2: jsonb("table2").notNull().$type<object[]>(),
});

export type Research = typeof researches.$inferSelect;
export type NewResearch = typeof researches.$inferInsert;
