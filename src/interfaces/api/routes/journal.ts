import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppDependencies } from "../composition-root.js";
import {
  serializeJournalEntry,
  serializePerformanceMetrics,
} from "../serializers.js";

const recordTradeSchema = z.object({
  symbol: z.string().min(1).max(10),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  thesis: z.string().min(1),
  aiRecommendation: z.string().optional(),
  outcome: z.enum(["win", "loss", "breakeven"]).optional(),
  lessonsLearned: z.string().optional(),
  strategyTag: z.enum(["breakout", "momentum", "news", "swing"]).optional(),
});

export function createJournalRoutes(deps: AppDependencies) {
  const app = new Hono();

  app.post("/", zValidator("json", recordTradeSchema), async (c) => {
    const body = c.req.valid("json");
    const result = await deps.recordTrade.execute(body);
    return c.json({ entry: serializeJournalEntry(result.entry) }, 201);
  });

  app.get("/", async (c) => {
    const entries = await deps.journalRepository.findAll();
    return c.json({
      entries: entries.map(serializeJournalEntry),
    });
  });

  app.get("/performance", async (c) => {
    const result = await deps.analyzePerformance.execute();
    return c.json({
      metrics: serializePerformanceMetrics(result.metrics),
    });
  });

  return app;
}
