import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppDependencies } from "./composition-root.js";
import { errorHandler } from "./error-handler.js";
import { createTradesRoutes } from "./routes/trades.js";
import { createWatchlistRoutes } from "./routes/watchlist.js";
import { createRiskRoutes } from "./routes/risk.js";
import { createJournalRoutes } from "./routes/journal.js";
import { createAccountRoutes } from "./routes/account.js";

export function createApp(deps: AppDependencies) {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    }),
  );

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.route("/api/trades", createTradesRoutes(deps));
  app.route("/api/watchlist", createWatchlistRoutes(deps));
  app.route("/api/risk", createRiskRoutes(deps));
  app.route("/api/journal", createJournalRoutes(deps));
  app.route("/api/account", createAccountRoutes(deps));

  app.onError((err, c) => errorHandler(err, c));

  return app;
}
