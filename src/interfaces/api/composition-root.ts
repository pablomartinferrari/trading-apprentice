import { createDatabase, type AppDatabase } from "../../infrastructure/persistence/db.js";
import { SQLiteJournalRepository } from "../../infrastructure/persistence/SQLiteJournalRepository.js";
import { MockMarketDataAdapter } from "../../infrastructure/market-data/MockMarketDataAdapter.js";
import { StubAIAnalysisAdapter } from "../../infrastructure/ai/StubAIAnalysisAdapter.js";
import { StubBrokerageAdapter } from "../../infrastructure/robinhood/StubBrokerageAdapter.js";
import { AnalyzeTradeUseCase } from "../../application/use-cases/AnalyzeTradeUseCase.js";
import { GenerateWatchlistUseCase } from "../../application/use-cases/GenerateWatchlistUseCase.js";
import { CalculatePositionSizeUseCase } from "../../application/use-cases/CalculatePositionSizeUseCase.js";
import { RecordTradeUseCase } from "../../application/use-cases/RecordTradeUseCase.js";
import { AnalyzePerformanceUseCase } from "../../application/use-cases/AnalyzePerformanceUseCase.js";
import type { MarketDataPort } from "../../application/ports/MarketDataPort.js";
import type { AIAnalysisPort } from "../../application/ports/AIAnalysisPort.js";
import type { BrokeragePort } from "../../application/ports/BrokeragePort.js";
import type { JournalRepository } from "../../application/ports/JournalRepository.js";

export interface AppDependencies {
  db: AppDatabase;
  marketData: MarketDataPort;
  aiAnalysis: AIAnalysisPort;
  brokerage: BrokeragePort;
  journalRepository: JournalRepository;
  analyzeTrade: AnalyzeTradeUseCase;
  generateWatchlist: GenerateWatchlistUseCase;
  calculatePositionSize: CalculatePositionSizeUseCase;
  recordTrade: RecordTradeUseCase;
  analyzePerformance: AnalyzePerformanceUseCase;
}

function resolveMarketData(): MarketDataPort {
  const provider = process.env.MARKET_DATA_PROVIDER ?? "mock";
  if (provider === "mock") return new MockMarketDataAdapter();
  throw new Error(`Unsupported MARKET_DATA_PROVIDER: ${provider}`);
}

function resolveAIAnalysis(): AIAnalysisPort {
  const provider = process.env.AI_PROVIDER ?? "stub";
  if (provider === "stub") return new StubAIAnalysisAdapter();
  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

function resolveBrokerage(): BrokeragePort {
  const provider = process.env.BROKERAGE_PROVIDER ?? "stub";
  const tradingEnabled = process.env.TRADING_ENABLED === "true";
  if (provider === "stub") return new StubBrokerageAdapter(tradingEnabled);
  throw new Error(`Unsupported BROKERAGE_PROVIDER: ${provider}`);
}

export function createAppDependencies(databasePath?: string): AppDependencies {
  const dbPath = databasePath ?? process.env.DATABASE_PATH ?? "./data/trading-apprentice.db";
  const db = createDatabase(dbPath);

  const marketData = resolveMarketData();
  const aiAnalysis = resolveAIAnalysis();
  const brokerage = resolveBrokerage();
  const journalRepository = new SQLiteJournalRepository(db);

  return {
    db,
    marketData,
    aiAnalysis,
    brokerage,
    journalRepository,
    analyzeTrade: new AnalyzeTradeUseCase(marketData, aiAnalysis, brokerage),
    generateWatchlist: new GenerateWatchlistUseCase(marketData),
    calculatePositionSize: new CalculatePositionSizeUseCase(brokerage),
    recordTrade: new RecordTradeUseCase(journalRepository),
    analyzePerformance: new AnalyzePerformanceUseCase(journalRepository),
  };
}
