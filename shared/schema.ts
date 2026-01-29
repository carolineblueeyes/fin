export * from "./models/auth";
export * from "./models/chat";

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

// === Receipts ===
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Matches users.id from auth
  imageUrl: text("image_url").notNull(),
  merchantName: text("merchant_name"),
  totalAmount: integer("total_amount"), // Store in cents
  currency: text("currency").default("USD"),
  date: timestamp("date"),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  items: jsonb("items").$type<Array<{ name: string; price: number; category?: string }>>(), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({ 
  id: true, 
  createdAt: true,
  status: true,
  items: true, // Items usually added after processing
  merchantName: true,
  totalAmount: true,
  date: true
});

// === Budgets ===
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  limitAmount: integer("limit_amount").notNull(), // In cents
  period: text("period").notNull().default("monthly"), // monthly, weekly
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true, createdAt: true });

// === Financial Advice ===
export const advice = pgTable("advice", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  context: text("context"), // What triggered this advice (e.g., "high_spending", "budget_exceeded")
  createdAt: timestamp("created_at").defaultNow(),
});

// === TYPES ===
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type Advice = typeof advice.$inferSelect;

// Request Types
export type CreateReceiptRequest = { imageUrl: string }; // Minimal for creation, AI fills the rest
export type UpdateReceiptRequest = Partial<Receipt>;
export type CreateBudgetRequest = InsertBudget;

