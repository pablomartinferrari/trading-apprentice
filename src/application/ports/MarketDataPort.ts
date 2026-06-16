export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  averageVolume: number;
  high: number;
  low: number;
  timestamp: Date;
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  publishedAt: Date;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface MarketMover {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  averageVolume: number;
  signals: string[];
}

export interface MarketDataPort {
  getQuote(symbol: string): Promise<Quote>;
  getHistoricalData(symbol: string, range?: string): Promise<Candle[]>;
  getNews(symbol: string): Promise<NewsArticle[]>;
  getMarketMovers(): Promise<MarketMover[]>;
}
