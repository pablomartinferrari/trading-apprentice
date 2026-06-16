import { describe, expect, it } from "vitest";
import { RecordTradeUseCase } from "./RecordTradeUseCase.js";
import { AnalyzePerformanceUseCase } from "./AnalyzePerformanceUseCase.js";
import { InMemoryJournalRepository } from "../../test/InMemoryJournalRepository.js";

describe("RecordTradeUseCase", () => {
  it("persists a journal entry", async () => {
    const repo = new InMemoryJournalRepository();
    const useCase = new RecordTradeUseCase(repo);

    const result = await useCase.execute({
      symbol: "PLTR",
      entryPrice: 20,
      exitPrice: 25,
      quantity: 10,
      thesis: "Breakout trade",
      strategyTag: "breakout",
    });

    expect(result.entry.symbol).toBe("PLTR");
    expect(result.entry.calculatePnL()).toBe(50);

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
  });
});

describe("AnalyzePerformanceUseCase", () => {
  it("computes win rate and strategy breakdown", async () => {
    const repo = new InMemoryJournalRepository();
    const record = new RecordTradeUseCase(repo);
    const analyze = new AnalyzePerformanceUseCase(repo);

    await record.execute({
      symbol: "PLTR",
      entryPrice: 20,
      exitPrice: 25,
      quantity: 10,
      thesis: "Win",
      strategyTag: "breakout",
    });
    await record.execute({
      symbol: "NVDA",
      entryPrice: 100,
      exitPrice: 90,
      quantity: 5,
      thesis: "Loss",
      strategyTag: "momentum",
    });

    const result = await analyze.execute();

    expect(result.metrics.totalTrades).toBe(2);
    expect(result.metrics.winRate).toBe(50);
    expect(result.metrics.byStrategy).toHaveLength(4);
  });
});
