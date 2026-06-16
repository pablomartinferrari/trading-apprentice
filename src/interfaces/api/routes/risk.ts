import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppDependencies } from "../composition-root.js";

const positionSizeSchema = z.object({
  accountBalance: z.number().positive().optional(),
  riskPercent: z.number().positive().max(100).optional(),
  entryPrice: z.number().positive(),
  stopPrice: z.number().positive(),
});

export function createRiskRoutes(deps: AppDependencies) {
  const app = new Hono();

  app.post("/position-size", zValidator("json", positionSizeSchema), async (c) => {
    const body = c.req.valid("json");
    const result = await deps.calculatePositionSize.execute(body);
    return c.json(result);
  });

  return app;
}
