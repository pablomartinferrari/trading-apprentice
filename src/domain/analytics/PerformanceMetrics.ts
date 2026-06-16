import type { StrategyTag } from "../journal/TradeJournal.js";

export interface StrategyPerformance {
  strategy: StrategyTag;
  winRate: number;
  tradeCount: number;
  totalPnL: number;
}

export interface PerformanceMetrics {
  winRate: number;
  averageGain: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  bestStrategy: StrategyTag | null;
  worstStrategy: StrategyTag | null;
  totalTrades: number;
  totalPnL: number;
  byStrategy: StrategyPerformance[];
}

export function emptyPerformanceMetrics(): PerformanceMetrics {
  return {
    winRate: 0,
    averageGain: 0,
    averageLoss: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    bestStrategy: null,
    worstStrategy: null,
    totalTrades: 0,
    totalPnL: 0,
    byStrategy: [],
  };
}
