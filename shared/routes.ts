import { z } from "zod";
import { insertCalculationSchema, calculations } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// AI Proxy Request Schema
const aiProxyInput = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  baseUrl: z.string().url("Invalid Base URL"),
  model: z.string().min(1, "Model name is required"),
  systemPrompt: z.string(),
  userPrompt: z.string(),
  temperature: z.number().optional().default(0.7),
});

export const api = {
  // Save calculation history
  calculations: {
    create: {
      method: "POST" as const,
      path: "/api/calculations" as const,
      input: insertCalculationSchema,
      responses: {
        201: z.custom<typeof calculations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/calculations" as const,
      responses: {
        200: z.array(z.custom<typeof calculations.$inferSelect>()),
      },
    },
  },
  // Proxy AI requests to avoid CORS and manage headers
  ai: {
    chat: {
      method: "POST" as const,
      path: "/api/ai/chat" as const,
      input: aiProxyInput,
      responses: {
        200: z.object({
          content: z.string(), // The raw JSON content string from AI
          parsed: z.any().optional(), // The parsed JSON if successful
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
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
