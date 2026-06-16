import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createAppDependencies } from "./composition-root.js";
import { createApp } from "./app.js";

describe("API integration", () => {
  let tempDir: string;
  let dbPath: string;
  let closeDb: (() => void) | undefined;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "trading-apprentice-"));
    dbPath = join(tempDir, "test.db");
  });

  afterEach(() => {
    closeDb?.();
    closeDb = undefined;
    rmSync(tempDir, { recursive: true, force: true });
  });

  function getApp() {
    const deps = createAppDependencies(dbPath);
    closeDb = () => deps.db.close();
    return createApp(deps);
  }

  it("POST /api/trades/analyze returns recommendation", async () => {
    const app = getApp();
    const res = await app.request("/api/trades/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: "PLTR" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      recommendation: { symbol: string; bullishFactors: string[] };
    };
    expect(body.recommendation.symbol).toBe("PLTR");
    expect(body.recommendation.bullishFactors).toBeInstanceOf(Array);
  });

  it("GET /api/watchlist returns candidates", async () => {
    const app = getApp();
    const res = await app.request("/api/watchlist?market=US");

    expect(res.status).toBe(200);
    const body = (await res.json()) as { candidates: unknown[] };
    expect(body.candidates.length).toBeGreaterThan(0);
  });

  it("POST /api/risk/position-size calculates shares", async () => {
    const app = getApp();
    const res = await app.request("/api/risk/position-size", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountBalance: 10000,
        riskPercent: 2,
        entryPrice: 100,
        stopPrice: 95,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { maxShares: number };
    expect(body.maxShares).toBe(40);
  });

  it("POST and GET /api/journal work", async () => {
    const app = getApp();

    const createRes = await app.request("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: "PLTR",
        entryPrice: 20,
        exitPrice: 25,
        quantity: 10,
        thesis: "Breakout above resistance",
        strategyTag: "breakout",
      }),
    });

    expect(createRes.status).toBe(201);

    const listRes = await app.request("/api/journal");
    expect(listRes.status).toBe(200);
    const listBody = (await listRes.json()) as {
      entries: Array<{ pnl: number }>;
    };
    expect(listBody.entries).toHaveLength(1);
    expect(listBody.entries[0].pnl).toBe(50);
  });

  it("GET /api/account returns account and positions", async () => {
    const app = getApp();
    const res = await app.request("/api/account");

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      account: { accountBalance: number };
      positions: unknown[];
    };
    expect(body.account.accountBalance).toBe(10000);
    expect(body.positions).toHaveLength(1);
  });

  it("GET /api/journal/performance returns metrics", async () => {
    const app = getApp();

    await app.request("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: "PLTR",
        entryPrice: 20,
        exitPrice: 25,
        quantity: 10,
        thesis: "Winning breakout",
        strategyTag: "breakout",
      }),
    });

    const res = await app.request("/api/journal/performance");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      metrics: { totalTrades: number; winRate: number };
    };
    expect(body.metrics.totalTrades).toBe(1);
    expect(body.metrics.winRate).toBe(100);
  });
});
