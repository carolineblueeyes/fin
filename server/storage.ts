import { 
  users, type User, type InsertUser,
  receipts, type Receipt, type InsertReceipt, type UpdateReceiptRequest,
  budgets, type Budget, type InsertBudget,
  advice, type Advice
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users (from Auth blueprint, keeping it here for reference/completeness if needed)
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Receipts
  getReceipts(userId: string): Promise<Receipt[]>;
  getReceipt(id: number): Promise<Receipt | undefined>;
  createReceipt(userId: string, receipt: InsertReceipt): Promise<Receipt>;
  updateReceipt(id: number, receipt: UpdateReceiptRequest): Promise<Receipt>;
  deleteReceipt(id: number): Promise<void>;

  // Budgets
  getBudgets(userId: string): Promise<Budget[]>;
  createBudget(userId: string, budget: InsertBudget): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  // Advice
  getAdvice(userId: string): Promise<Advice[]>;
  createAdvice(userId: string, content: string, context?: string): Promise<Advice>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Receipts
  async getReceipts(userId: string): Promise<Receipt[]> {
    return await db.select().from(receipts)
      .where(eq(receipts.userId, userId))
      .orderBy(desc(receipts.date));
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id));
    return receipt;
  }

  async createReceipt(userId: string, receipt: InsertReceipt): Promise<Receipt> {
    const [newReceipt] = await db.insert(receipts)
      .values({ ...receipt, userId })
      .returning();
    return newReceipt;
  }

  async updateReceipt(id: number, update: UpdateReceiptRequest): Promise<Receipt> {
    const [updated] = await db.update(receipts)
      .set(update)
      .where(eq(receipts.id, id))
      .returning();
    return updated;
  }

  async deleteReceipt(id: number): Promise<void> {
    await db.delete(receipts).where(eq(receipts.id, id));
  }

  // Budgets
  async getBudgets(userId: string): Promise<Budget[]> {
    return await db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async createBudget(userId: string, budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(budgets)
      .values({ ...budget, userId })
      .returning();
    return newBudget;
  }

  async deleteBudget(id: number): Promise<void> {
    await db.delete(budgets).where(eq(budgets.id, id));
  }

  // Advice
  async getAdvice(userId: string): Promise<Advice[]> {
    return await db.select().from(advice)
      .where(eq(advice.userId, userId))
      .orderBy(desc(advice.createdAt))
      .limit(10);
  }

  async createAdvice(userId: string, content: string, context?: string): Promise<Advice> {
    const [newAdvice] = await db.insert(advice)
      .values({ userId, content, context })
      .returning();
    return newAdvice;
  }
}

export const storage = new DatabaseStorage();
