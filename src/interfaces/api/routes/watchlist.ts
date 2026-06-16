import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppDependencies } from "../composition-root.js";
import { serializeWatchlistCandidate } from "../serializers.js";

const watchlistQuerySchema = z.object({
  market: z.enum(["US"]).default("US"),
});

export function createWatchlistRoutes(deps: AppDependencies) {
  const app = new Hono();

  app.get("/", zValidator("query", watchlistQuerySchema), async (c) => {
    const query = c.req.valid("query");
    const result = await deps.generateWatchlist.execute({ market: query.market });

    return c.json({
      candidates: result.candidates.map(serializeWatchlistCandidate),
    });
  });

  return app;
}
