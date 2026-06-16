import { describe, expect, it } from "vitest";
import { TradeJournal } from "./TradeJournal.js";

describe("TradeJournal", () => {
  it("calculates PnL and return for winning trade", () => {
    const trade = new TradeJournal({
      symbol: "PLTR",
      entryPrice: 20,
      exitPrice: 25,
      quantity: 10,
      thesis: "Breakout above resistance",
      strategyTag: "breakout",
    });

    expect(trade.calculatePnL()).toBe(50);
    expect(trade.calculateReturn()).toBe(25);
    expect(trade.outcome).toBe("win");
  });

  it("derives loss outcome", () => {
    const trade = new TradeJournal({
      symbol: "NVDA",
      entryPrice: 100,
      exitPrice: 90,
      quantity: 5,
      thesis: "Momentum chase",
    });

    expect(trade.calculatePnL()).toBe(-50);
    expect(trade.outcome).toBe("loss");
  });

  it("requires thesis", () => {
    expect(
      () =>
        new TradeJournal({
          symbol: "AAPL",
          entryPrice: 100,
          exitPrice: 105,
          quantity: 1,
          thesis: "   ",
        }),
    ).toThrow("Thesis is required");
  });
});
