import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

// ============================================
// 💰 商业化配置区
// ============================================
// 🔒 绝对机密：你的真实 API Key 藏在这里！(前端绝对看不到)
const ALIYUN_API_KEY = "sk-26da5fa61572444db1638139f8bfbdce";

// 🔑 你的“摇钱树”：有效激活码列表
// 用户付钱后，你把下面这些码发给他们填在网页的设置里
const VALID_CODES = ["FANS-888", "VIP-999", "BOSS-123"];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Proxy Endpoint for AI Chat
  app.post(api.ai.chat.path, async (req, res) => {
    try {
      // 这里的 apiKey，其实前端传过来的是用户的【激活码】
      const { apiKey, baseUrl, model, systemPrompt, userPrompt, temperature } = api.ai.chat.input.parse(req.body);

      // ----------------------------------------------------
      // ⛔ 收费闸门：验证激活码
      // ----------------------------------------------------
      if (!VALID_CODES.includes(apiKey)) {
        console.warn(`[拦截] 尝试使用无效激活码: ${apiKey}`);
        return res.status(403).json({
          message: "【激活码无效或已过期】请添加主理人微信 (WeChat: X79Y99) 购买高级算力包解锁体验。"
        });
      }

      // Clean up base URL (remove trailing slash)
      const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
      const url = `${cleanBaseUrl}/chat/completions`;

      console.log(`[AI Proxy] 验证通过，准备请求阿里云: ${url} with model ${model}`);

      // ----------------------------------------------------
      // 🚀 核心替换：使用后端的真实 API Key 发起请求
      // ----------------------------------------------------
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 这里强制使用后端的真实 KEY，不用前端传来的码
          "Authorization": `Bearer ${ALIYUN_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: temperature,
          response_format: { type: "json_object" } // Try to enforce JSON if supported
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI Proxy] Upstream Error: ${response.status} - ${errorText}`);
        return res.status(response.status).json({
          message: `AI Provider Error: ${errorText}`,
        });
      }

      const data = await response.json();
      
      // Extract content - handle different OpenAI-compatible structures if needed, but standard is choices[0].message.content
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return res.status(500).json({ message: "Invalid response format from AI provider" });
      }

      // Try to parse JSON inside the content to ensure validity
      let parsed = null;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        // If strict JSON mode failed or wasn't supported, we might get markdown code blocks
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
        if (jsonMatch) {
          try {
             parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch (e2) {
             console.warn("Failed to parse extracted JSON");
          }
        }
      }

      res.json({ content, parsed });

    } catch (err) {
      console.error("[AI Proxy] Internal Error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Calculation History Endpoints
  app.post(api.calculations.create.path, async (req, res) => {
    try {
      const input = api.calculations.create.input.parse(req.body);
      const result = await storage.createCalculation(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.calculations.list.path, async (req, res) => {
    const results = await storage.getCalculations();
    res.json(results);
  });

  return httpServer;
}