import { describe, expect, it } from "vitest";
import { CalculatePositionSizeUseCase } from "./CalculatePositionSizeUseCase.js";

describe("CalculatePositionSizeUseCase", () => {
  it("calculates shares from balance and risk", async () => {
    const useCase = new CalculatePositionSizeUseCase();
    const result = await useCase.execute({
      accountBalance: 10000,
      riskPercent: 2,
      entryPrice: 100,
      stopPrice: 95,
    });

    expect(result.maxShares).toBe(40);
    expect(result.riskPerShare).toBe(5);
    expect(result.maxLoss).toBe(200);
  });
});
