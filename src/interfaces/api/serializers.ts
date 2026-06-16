import type { TradeRecommendation } from "../../domain/recommendation/TradeRecommendation.js";
import type { TradeJournal } from "../../domain/journal/TradeJournal.js";
import type { WatchlistCandidate } from "../../domain/watchlist/WatchlistCandidate.js";
import type { PerformanceMetrics } from "../../domain/analytics/PerformanceMetrics.js";

export function serializeRecommendation(rec: TradeRecommendation) {
  return {
    symbol: rec.symbol,
    bullishFactors: rec.bullishFactors,
    bearishFactors: rec.bearishFactors,
    confidenceScore: rec.confidenceScore.value,
    riskScore: rec.riskScore.value,
    riskLevel: rec.riskLevel,
    suggestedEntry: rec.suggestedEntry,
    suggestedStopLoss: rec.suggestedStopLoss,
    suggestedPositionSize: rec.suggestedPositionSize,
    recommendation: rec.recommendation,
    status: rec.status,
    generatedAt: rec.generatedAt.toISOString(),
  };
}

export function serializeJournalEntry(entry: TradeJournal) {
  return {
    id: entry.id,
    symbol: entry.symbol,
    entryPrice: entry.entryPrice,
    exitPrice: entry.exitPrice,
    quantity: entry.quantity,
    thesis: entry.thesis,
    aiRecommendation: entry.aiRecommendation,
    outcome: entry.outcome,
    lessonsLearned: entry.lessonsLearned,
    strategyTag: entry.strategyTag,
    pnl: entry.calculatePnL(),
    returnPercent: entry.calculateReturn(),
    recordedAt: entry.recordedAt.toISOString(),
  };
}

export function serializeWatchlistCandidate(candidate: WatchlistCandidate) {
  return {
    symbol: candidate.symbol,
    reasons: candidate.reasons,
    signals: candidate.signals,
    scannedAt: candidate.scannedAt.toISOString(),
  };
}

export function serializePerformanceMetrics(metrics: PerformanceMetrics) {
  return {
    winRate: metrics.winRate,
    averageGain: metrics.averageGain,
    averageLoss: metrics.averageLoss,
    profitFactor: metrics.profitFactor,
    maxDrawdown: metrics.maxDrawdown,
    bestStrategy: metrics.bestStrategy,
    worstStrategy: metrics.worstStrategy,
    totalTrades: metrics.totalTrades,
    totalPnL: metrics.totalPnL,
    byStrategy: metrics.byStrategy,
  };
}
