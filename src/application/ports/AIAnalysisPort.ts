import type { TradeRecommendation } from "../../domain/recommendation/TradeRecommendation.js";
import type { Candle, NewsArticle, Quote } from "./MarketDataPort.js";

export interface AccountContext {
  balance: number;
  buyingPower: number;
  openPositions: Array<{
    symbol: string;
    quantity: number;
    averageCost: number;
  }>;
}

export interface AnalyzeTradeRequest {
  symbol: string;
  desiredEntryPrice?: number;
  quote: Quote;
  candles: Candle[];
  news: NewsArticle[];
  accountContext?: AccountContext;
}

export interface AIAnalysisPort {
  analyzeTrade(input: AnalyzeTradeRequest): Promise<TradeRecommendation>;
}
