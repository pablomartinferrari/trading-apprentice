import {
  emptyPerformanceMetrics,
  type PerformanceMetrics,
  type StrategyPerformance,
} from "../../domain/analytics/PerformanceMetrics.js";
import type { StrategyTag } from "../../domain/journal/TradeJournal.js";
import type { AnalyzePerformanceOutput } from "../dto/index.js";
import type { JournalRepository } from "../ports/JournalRepository.js";

export class AnalyzePerformanceUseCase {
  constructor(private readonly journalRepository: JournalRepository) {}

  async execute(): Promise<AnalyzePerformanceOutput> {
    const trades = await this.journalRepository.findAll();

    if (trades.length === 0) {
      return { metrics: emptyPerformanceMetrics() };
    }

    const wins = trades.filter((t) => t.outcome === "win");
    const losses = trades.filter((t) => t.outcome === "loss");

    const winRate = (wins.length / trades.length) * 100;

    const gains = wins.map((t) => t.calculatePnL());
    const lossAmounts = losses.map((t) => Math.abs(t.calculatePnL()));

    const averageGain =
      gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
    const averageLoss =
      lossAmounts.length > 0
        ? lossAmounts.reduce((a, b) => a + b, 0) / lossAmounts.length
        : 0;

    const totalGains = gains.reduce((a, b) => a + b, 0);
    const totalLosses = lossAmounts.reduce((a, b) => a + b, 0);
    const profitFactor =
      totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? Infinity : 0;

    const maxDrawdown = this.calculateMaxDrawdown(trades.map((t) => t.calculatePnL()));
    const byStrategy = this.aggregateByStrategy(trades);

    const sorted = [...byStrategy].sort((a, b) => b.winRate - a.winRate);
    const bestStrategy = sorted[0]?.tradeCount > 0 ? sorted[0].strategy : null;
    const worstStrategy =
      sorted.length > 0 && sorted[sorted.length - 1].tradeCount > 0
        ? sorted[sorted.length - 1].strategy
        : null;

    const metrics: PerformanceMetrics = {
      winRate,
      averageGain,
      averageLoss,
      profitFactor: Number.isFinite(profitFactor) ? profitFactor : 0,
      maxDrawdown,
      bestStrategy,
      worstStrategy,
      totalTrades: trades.length,
      totalPnL: trades.reduce((sum, t) => sum + t.calculatePnL(), 0),
      byStrategy,
    };

    return { metrics };
  }

  private calculateMaxDrawdown(pnls: number[]): number {
    let peak = 0;
    let cumulative = 0;
    let maxDrawdown = 0;

    for (const pnl of pnls) {
      cumulative += pnl;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return maxDrawdown;
  }

  private aggregateByStrategy(
    trades: Awaited<ReturnType<JournalRepository["findAll"]>>,
  ): StrategyPerformance[] {
    const strategies: StrategyTag[] = ["breakout", "momentum", "news", "swing"];
    return strategies.map((strategy) => {
      const subset = trades.filter((t) => t.strategyTag === strategy);
      const wins = subset.filter((t) => t.outcome === "win");
      return {
        strategy,
        winRate: subset.length > 0 ? (wins.length / subset.length) * 100 : 0,
        tradeCount: subset.length,
        totalPnL: subset.reduce((sum, t) => sum + t.calculatePnL(), 0),
      };
    });
  }
}
