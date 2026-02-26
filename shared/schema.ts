import { pgTable, text, serial, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  scenarioType: text("scenario_type").notNull(), // 'car', 'house', 'business', 'general'
  inputs: jsonb("inputs").notNull(), // Stores the user's financial inputs
  aiResult: jsonb("ai_result"), // Stores the AI's analysis
  riskScore: integer("risk_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
  createdAt: true,
});

export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
