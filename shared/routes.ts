import { z } from 'zod';
import { insertReceiptSchema, insertBudgetSchema, receipts, budgets, advice } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  receipts: {
    list: {
      method: 'GET' as const,
      path: '/api/receipts',
      responses: {
        200: z.array(z.custom<typeof receipts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/receipts/:id',
      responses: {
        200: z.custom<typeof receipts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/receipts',
      input: z.object({ imageUrl: z.string() }),
      responses: {
        201: z.custom<typeof receipts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/receipts/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  budgets: {
    list: {
      method: 'GET' as const,
      path: '/api/budgets',
      responses: {
        200: z.array(z.custom<typeof budgets.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/budgets',
      input: insertBudgetSchema,
      responses: {
        201: z.custom<typeof budgets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budgets/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  advice: {
    list: {
      method: 'GET' as const,
      path: '/api/advice',
      responses: {
        200: z.array(z.custom<typeof advice.$inferSelect>()),
      },
    },
    generate: { // Trigger manual generation
      method: 'POST' as const,
      path: '/api/advice/generate',
      responses: {
        201: z.custom<typeof advice.$inferSelect>(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
