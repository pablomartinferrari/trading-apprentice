import { describe, expect, it } from "vitest";
import { GenerateWatchlistUseCase } from "./GenerateWatchlistUseCase.js";
import { MockMarketDataAdapter } from "../../infrastructure/market-data/MockMarketDataAdapter.js";

describe("GenerateWatchlistUseCase", () => {
  it("returns watchlist candidates with reasons", async () => {
    const useCase = new GenerateWatchlistUseCase(new MockMarketDataAdapter());
    const result = await useCase.execute({ market: "US" });

    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].reasons.length).toBeGreaterThan(0);
    expect(result.candidates[0].signals.length).toBeGreaterThan(0);
  });
});
