import type { AnalyzeTradeRequest } from "../../application/ports/AIAnalysisPort.js";
import { TradeRecommendation } from "../../domain/recommendation/TradeRecommendation.js";
import type { AIAnalysisPort } from "../../application/ports/AIAnalysisPort.js";
import type { RecommendationAction, RiskLevel } from "../../domain/recommendation/TradeRecommendation.js";

export class StubAIAnalysisAdapter implements AIAnalysisPort {
  async analyzeTrade(input: AnalyzeTradeRequest): Promise<TradeRecommendation> {
    const { quote, candles, news, symbol, desiredEntryPrice } = input;

    const bullishFactors: string[] = [];
    const bearishFactors: string[] = [];

    if (quote.changePercent > 0) {
      bullishFactors.push(
        `Price is up ${quote.changePercent.toFixed(1)}% — short-term momentum is positive`,
      );
    } else {
      bearishFactors.push(
        `Price is down ${Math.abs(quote.changePercent).toFixed(1)}% — weakness in current session`,
      );
    }

    const rvol = quote.averageVolume > 0 ? quote.volume / quote.averageVolume : 1;
    if (rvol > 1.5) {
      bullishFactors.push(
        `Relative volume ${rvol.toFixed(1)}x average suggests elevated interest`,
      );
    } else {
      bearishFactors.push(
        `Volume is only ${rvol.toFixed(1)}x average — move may lack conviction`,
      );
    }

    const recentHigh = Math.max(...candles.map((c) => c.high));
    const recentLow = Math.min(...candles.map((c) => c.low));
    bearishFactors.push(
      `Resistance near $${recentHigh.toFixed(2)} — price may struggle above this level`,
    );
    bullishFactors.push(
      `Support established near $${recentLow.toFixed(2)}`,
    );

    for (const article of news) {
      if (article.sentiment === "positive") {
        bullishFactors.push(`News catalyst: ${article.headline}`);
      } else if (article.sentiment === "negative") {
        bearishFactors.push(`News risk: ${article.headline}`);
      }
    }

    bearishFactors.push(
      "Chasing extended moves without a defined stop is a common beginner mistake",
    );
    bearishFactors.push(
      "Sector weakness or negative market conditions could override individual stock strength",
    );

    if (input.accountContext) {
      const existing = input.accountContext.openPositions.find(
        (p) => p.symbol === symbol,
      );
      if (existing) {
        bearishFactors.push(
          `You already hold ${existing.quantity} shares — consider concentration risk`,
        );
      }
    }

    const entry = desiredEntryPrice ?? quote.price;
    const stopDistance = entry * 0.05;
    const suggestedStopLoss =
      quote.changePercent >= 0 ? entry - stopDistance : entry - stopDistance * 1.2;

    const riskScore = this.computeRiskScore(quote, rvol, bearishFactors.length);
    const confidenceScore = this.computeConfidence(bullishFactors.length, bearishFactors.length);
    const riskLevel = this.riskLevelFromScore(riskScore);
    const recommendation = this.recommendationAction(confidenceScore, riskScore);

    const suggestedPositionSize =
      input.accountContext && entry > suggestedStopLoss
        ? Math.floor(
            (input.accountContext.balance * 0.02) /
              Math.abs(entry - suggestedStopLoss),
          )
        : 0;

    return new TradeRecommendation({
      symbol,
      bullishFactors,
      bearishFactors,
      confidenceScore,
      riskScore,
      riskLevel,
      suggestedEntry: entry,
      suggestedStopLoss: Number(suggestedStopLoss.toFixed(2)),
      suggestedPositionSize,
      recommendation,
    });
  }

  private computeRiskScore(
    quote: AnalyzeTradeRequest["quote"],
    rvol: number,
    bearishCount: number,
  ): number {
    let score = 40;
    if (Math.abs(quote.changePercent) > 5) score += 15;
    if (rvol < 1) score += 10;
    score += Math.min(bearishCount * 3, 20);
    return Math.min(100, score);
  }

  private computeConfidence(bullish: number, bearish: number): number {
    const net = bullish - bearish;
    return Math.max(10, Math.min(90, 50 + net * 5));
  }

  private riskLevelFromScore(score: number): RiskLevel {
    if (score < 40) return "low";
    if (score < 65) return "medium";
    return "high";
  }

  private recommendationAction(
    confidence: number,
    risk: number,
  ): RecommendationAction {
    if (confidence >= 60 && risk < 60) return "buy";
    if (confidence < 40 || risk >= 75) return "avoid";
    return "hold";
  }
}
