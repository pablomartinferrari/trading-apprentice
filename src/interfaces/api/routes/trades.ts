import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppDependencies } from "../composition-root.js";
import { serializeRecommendation } from "../serializers.js";

const analyzeSchema = z.object({
  symbol: z.string().min(1).max(10),
  desiredEntryPrice: z.number().positive().optional(),
});

export function createTradesRoutes(deps: AppDependencies) {
  const app = new Hono();

  app.post("/analyze", zValidator("json", analyzeSchema), async (c) => {
    const body = c.req.valid("json");
    const result = await deps.analyzeTrade.execute({
      symbol: body.symbol,
      desiredEntryPrice: body.desiredEntryPrice,
    });

    return c.json({
      recommendation: serializeRecommendation(result.recommendation),
    });
  });

  return app;
}
