import { describe, expect, it } from "vitest";
import { TraderAccount } from "./TraderAccount.js";

describe("TraderAccount", () => {
  const account = new TraderAccount({
    id: "acc-1",
    accountBalance: 10000,
    buyingPower: 8000,
    maxRiskPerTrade: 2,
    maxDailyLoss: 500,
    openPositions: [
      {
        symbol: "AAPL",
        quantity: 10,
        averageCost: 150,
        currentPrice: 160,
      },
    ],
    dailyLossSoFar: 100,
  });

  it("calculates position size from risk percent and stop distance", () => {
    const size = account.calculatePositionSize(100, 95);
    // 2% of 10000 = 200 max risk, 5 per share => 40 shares
    expect(size.shares).toBe(40);
  });

  it("rejects zero stop distance", () => {
    expect(() => account.calculatePositionSize(100, 100)).toThrow(
      "Stop price must differ from entry price",
    );
  });

  it("validates per-trade risk limit", () => {
    expect(() => account.validateRisk(250)).toThrow("exceeds max per-trade risk");
    expect(() => account.validateRisk(150)).not.toThrow();
  });

  it("validates daily loss budget", () => {
    const tightDailyAccount = new TraderAccount({
      id: "acc-daily",
      accountBalance: 10000,
      buyingPower: 8000,
      maxRiskPerTrade: 5,
      maxDailyLoss: 500,
      openPositions: [],
      dailyLossSoFar: 350,
    });

    expect(() => tightDailyAccount.validateRisk(250)).toThrow(
      "exceeds remaining daily loss budget",
    );
  });

  it("evaluates exposure", () => {
    const exposure = account.evaluateExposure();
    expect(exposure.positionCount).toBe(1);
    expect(exposure.totalPositionValue).toBe(1600);
    expect(exposure.largestPositionSymbol).toBe("AAPL");
  });
});
