import type { Context } from "hono";
import {
  DomainError,
  TradingDisabledError,
  ValidationError,
} from "../../shared/errors.js";

export function errorHandler(err: Error, c: Context) {
  console.error(err);

  if (err instanceof ValidationError) {
    return c.json({ error: err.message }, 400);
  }

  if (err instanceof DomainError) {
    return c.json({ error: err.message }, 422);
  }

  if (err instanceof TradingDisabledError) {
    return c.json({ error: err.message }, 403);
  }

  if (err.name === "ZodError") {
    return c.json({ error: "Invalid request", details: (err as { issues?: unknown }).issues }, 400);
  }

  return c.json({ error: "Internal server error" }, 500);
}
