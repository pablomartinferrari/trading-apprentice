import type { PerformanceMetrics } from "../../domain/analytics/PerformanceMetrics.js";
import type { TradeJournal } from "../../domain/journal/TradeJournal.js";
import type { TradeRecommendation } from "../../domain/recommendation/TradeRecommendation.js";
import type { WatchlistCandidate } from "../../domain/watchlist/WatchlistCandidate.js";

export interface AnalyzeTradeInput {
  symbol: string;
  desiredEntryPrice?: number;
}

export interface AnalyzeTradeOutput {
  recommendation: TradeRecommendation;
}

export interface GenerateWatchlistInput {
  market: "US";
}

export interface GenerateWatchlistOutput {
  candidates: WatchlistCandidate[];
}

export interface CalculatePositionSizeInput {
  accountBalance?: number;
  riskPercent?: number;
  entryPrice: number;
  stopPrice: number;
}

export interface CalculatePositionSizeOutput {
  maxShares: number;
  maxLoss: number;
  riskPerShare: number;
}

export interface RecordTradeInput {
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  thesis: string;
  aiRecommendation?: string;
  outcome?: "win" | "loss" | "breakeven";
  lessonsLearned?: string;
  strategyTag?: "breakout" | "momentum" | "news" | "swing";
}

export interface RecordTradeOutput {
  entry: TradeJournal;
}

export interface AnalyzePerformanceOutput {
  metrics: PerformanceMetrics;
}
