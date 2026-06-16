import { describe, expect, it } from "vitest";
import { AnalyzeTradeUseCase } from "./AnalyzeTradeUseCase.js";
import { MockMarketDataAdapter } from "../../infrastructure/market-data/MockMarketDataAdapter.js";
import { StubAIAnalysisAdapter } from "../../infrastructure/ai/StubAIAnalysisAdapter.js";
import { StubBrokerageAdapter } from "../../infrastructure/robinhood/StubBrokerageAdapter.js";

describe("AnalyzeTradeUseCase", () => {
  it("returns a trade recommendation for a symbol", async () => {
    const useCase = new AnalyzeTradeUseCase(
      new MockMarketDataAdapter(),
      new StubAIAnalysisAdapter(),
      new StubBrokerageAdapter(),
    );

    const result = await useCase.execute({ symbol: "PLTR" });

    expect(result.recommendation.symbol).toBe("PLTR");
    expect(result.recommendation.bullishFactors.length).toBeGreaterThan(0);
    expect(result.recommendation.bearishFactors.length).toBeGreaterThan(0);
    expect(result.recommendation.confidenceScore.value).toBeGreaterThan(0);
  });
});
