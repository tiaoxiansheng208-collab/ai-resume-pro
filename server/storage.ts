import { db } from "./db";
import { calculations, type InsertCalculation, type Calculation } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculations(): Promise<Calculation[]>;
}

export class DatabaseStorage implements IStorage {
  async createCalculation(calculation: InsertCalculation): Promise<Calculation> {
    const [result] = await db.insert(calculations).values(calculation).returning();
    return result;
  }

  async getCalculations(): Promise<Calculation[]> {
    return await db.select().from(calculations).orderBy(desc(calculations.createdAt));
  }
}

export const storage = new DatabaseStorage();
