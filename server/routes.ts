import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  // app.get(api.receipts.list.path, isAuthenticated, async (req, res) => {
  app.get(api.receipts.list.path, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub || "demo-user";
    const receipts = await storage.getReceipts(userId);
    res.json(receipts);
  });

  // app.get(api.receipts.get.path, isAuthenticated, async (req, res) => {
  app.get(api.receipts.get.path, async (req, res) => {
    const receipt = await storage.getReceipt(Number(req.params.id));
    // if (!receipt || receipt.userId !== (req.user as any).claims.sub) {
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.json(receipt);
  });

  // app.post(api.receipts.create.path, isAuthenticated, async (req, res) => {
  app.post(api.receipts.create.path, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || "demo-user";
      const input = api.receipts.create.input.parse(req.body);
      
      const receipt = await storage.createReceipt(userId, {
        imageUrl: input.imageUrl,
        status: "processing"
      });
      
      processReceipt(receipt.id, input.imageUrl).catch(err => {
        console.error("Error processing receipt:", err);
        storage.updateReceipt(receipt.id, { status: "failed" });
      });

      res.status(201).json(receipt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.receipts.delete.path, async (req, res) => {
    const receipt = await storage.getReceipt(Number(req.params.id));
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    await storage.deleteReceipt(Number(req.params.id));
    res.status(204).send();
  });

  // === Budgets ===
  app.get(api.budgets.list.path, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub || "demo-user";
    const budgets = await storage.getBudgets(userId);
    res.json(budgets);
  });

  app.post(api.budgets.create.path, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub || "demo-user";
      const input = api.budgets.create.input.parse(req.body);
      const budget = await storage.createBudget(userId, input);
      res.status(201).json(budget);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.budgets.delete.path, async (req, res) => {
    await storage.deleteBudget(Number(req.params.id));
    res.status(204).send();
  });

  // === Advice ===
  app.get(api.advice.list.path, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub || "demo-user";
    const advice = await storage.getAdvice(userId);
    res.json(advice);
  });

  app.post(api.advice.generate.path, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub || "demo-user";
    
    // Gather context
    const receipts = await storage.getReceipts(userId);
    const budgets = await storage.getBudgets(userId);
    
    // Generate Advice
    const adviceContent = await generateFinancialAdvice(receipts, budgets);
    
    const advice = await storage.createAdvice(userId, adviceContent, "manual_generation");
    res.status(201).json(advice);
  });

  return httpServer;
}

// === Helpers ===

async function processReceipt(receiptId: number, imageUrl: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1", // Use latest model as per blueprint
      messages: [
        {
          role: "system",
          content: `You are an expert financial assistant. Analyze the receipt image and extract:
1. Merchant name
2. Date of purchase
3. Total amount (as an integer in CENTS, e.g., $10.50 -> 1050)
4. Items: array of { name: string, price: number (in CENTS), category: string }

Assign a specific category to each item from this list: "Food & Dining", "Groceries", "Shopping", "Transport", "Utilities", "Health", "Entertainment", "Personal Care", "Education", "Other".

Return ONLY valid JSON in this format:
{
  "merchantName": "...",
  "date": "YYYY-MM-DD",
  "totalAmount": 0,
  "items": [
    { "name": "...", "price": 0, "category": "..." }
  ]
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this receipt." },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from AI");
    
    const data = JSON.parse(content);
    
    // Ensure all amounts are integers (cents)
    const merchantName = data.merchantName || "Unknown Merchant";
    const totalAmount = Math.round(data.totalAmount || 0);
    const date = data.date ? new Date(data.date) : new Date();
    const items = (data.items || []).map((item: any) => ({
      ...item,
      price: Math.round(item.price || 0)
    }));

    await storage.updateReceipt(receiptId, {
      merchantName,
      totalAmount,
      date,
      items,
      status: "completed"
    });
  } catch (error) {
    console.error("AI Processing Failed:", error);
    await storage.updateReceipt(receiptId, { status: "failed" });
  }
}

async function generateFinancialAdvice(receipts: any[], budgets: any[]) {
  // Enhanced context for better advice
  const recentReceipts = receipts.slice(0, 15);
  const spendingByCategory = recentReceipts.reduce((acc: any, r: any) => {
    (r.items || []).forEach((item: any) => {
      const cat = item.category || "Other";
      acc[cat] = (acc[cat] || 0) + item.price;
    });
    return acc;
  }, {});

  const prompt = `
    Analyze this financial profile and provide 3 highly specific, actionable tips to save money.
    
    Budgets: ${JSON.stringify(budgets)}
    Spending by Category (in cents): ${JSON.stringify(spendingByCategory)}
    Recent Merchant Activity: ${JSON.stringify(recentReceipts.map(r => ({ merchant: r.merchantName, total: r.totalAmount })))}
    
    The user wants to optimize their budget and categorize their spending better.
    Format your response as a numbered list with bold headings.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content || "Keep tracking your expenses to get better advice!";
}
