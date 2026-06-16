import type {
  Candle,
  MarketDataPort,
  MarketMover,
  NewsArticle,
  Quote,
} from "../../application/ports/MarketDataPort.js";
interface SymbolProfile {
  price: number;
  changePercent: number;
  volume: number;
  averageVolume: number;
  high: number;
  low: number;
  news: NewsArticle[];
  candles: Candle[];
  signals?: string[];
}

const PROFILES: Record<string, SymbolProfile> = {
  PLTR: {
    price: 24.5,
    changePercent: 3.2,
    volume: 45_000_000,
    averageVolume: 28_000_000,
    high: 25.1,
    low: 23.8,
    signals: ["high_rvol", "news_catalyst"],
    news: [
      {
        headline: "Palantir wins new government contract",
        summary: "Analysts see continued revenue growth from government sector.",
        source: "MockWire",
        publishedAt: new Date(),
        sentiment: "positive",
      },
      {
        headline: "Tech sector faces valuation scrutiny",
        summary: "Rising rates may pressure high-multiple software names.",
        source: "MockDaily",
        publishedAt: new Date(),
        sentiment: "negative",
      },
    ],
    candles: buildCandles(24.5, 5),
  },
  NVDA: {
    price: 135.2,
    changePercent: 1.8,
    volume: 52_000_000,
    averageVolume: 40_000_000,
    high: 137.0,
    low: 132.5,
    signals: ["gap_up", "high_rvol"],
    news: [
      {
        headline: "NVIDIA AI demand remains strong",
        summary: "Data center revenue continues to beat expectations.",
        source: "MockWire",
        publishedAt: new Date(),
        sentiment: "positive",
      },
    ],
    candles: buildCandles(135.2, 5),
  },
  TSLA: {
    price: 248.0,
    changePercent: -4.1,
    volume: 95_000_000,
    averageVolume: 55_000_000,
    high: 260.0,
    low: 245.0,
    signals: ["gap_down", "earnings"],
    news: [
      {
        headline: "Tesla deliveries miss estimates",
        summary: "Quarterly delivery numbers came in below consensus.",
        source: "MockWire",
        publishedAt: new Date(),
        sentiment: "negative",
      },
    ],
    candles: buildCandles(248.0, -3),
  },
  AMD: {
    price: 162.3,
    changePercent: 5.5,
    volume: 38_000_000,
    averageVolume: 22_000_000,
    high: 164.0,
    low: 155.0,
    signals: ["gap_up", "unusual_activity"],
    news: [
      {
        headline: "AMD gains data center share",
        summary: "New chip lineup gaining traction with cloud providers.",
        source: "MockWire",
        publishedAt: new Date(),
        sentiment: "positive",
      },
    ],
    candles: buildCandles(162.3, 4),
  },
  SNAP: {
    price: 11.2,
    changePercent: -6.2,
    volume: 30_000_000,
    averageVolume: 15_000_000,
    high: 12.5,
    low: 11.0,
    signals: ["gap_down", "news_catalyst"],
    news: [
      {
        headline: "Snap ad revenue guidance lowered",
        summary: "Management cites macro headwinds in digital advertising.",
        source: "MockDaily",
        publishedAt: new Date(),
        sentiment: "negative",
      },
    ],
    candles: buildCandles(11.2, -5),
  },
};

function buildCandles(basePrice: number, trend: number): Candle[] {
  const candles: Candle[] = [];
  for (let i = 9; i >= 0; i--) {
    const drift = trend * 0.1 * (10 - i);
    const close = basePrice - drift;
    candles.push({
      date: new Date(Date.now() - i * 86_400_000).toISOString().split("T")[0],
      open: close - 0.5,
      high: close + 1,
      low: close - 1,
      close,
      volume: 20_000_000 + i * 1_000_000,
    });
  }
  return candles;
}

function defaultProfile(symbol: string): SymbolProfile {
  const hash = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const price = 50 + (hash % 200);
  return {
    price,
    changePercent: (hash % 10) - 5,
    volume: 10_000_000,
    averageVolume: 8_000_000,
    high: price * 1.02,
    low: price * 0.98,
    news: [
      {
        headline: `${symbol} in focus ahead of market open`,
        summary: "Traders watching key support and resistance levels.",
        source: "MockWire",
        publishedAt: new Date(),
        sentiment: "neutral",
      },
    ],
    candles: buildCandles(price, 0),
    signals: ["unusual_activity"],
  };
}

export class MockMarketDataAdapter implements MarketDataPort {
  async getQuote(symbol: string): Promise<Quote> {
    const profile = this.getProfile(symbol);
    return {
      symbol: symbol.toUpperCase(),
      price: profile.price,
      change: profile.price * (profile.changePercent / 100),
      changePercent: profile.changePercent,
      volume: profile.volume,
      averageVolume: profile.averageVolume,
      high: profile.high,
      low: profile.low,
      timestamp: new Date(),
    };
  }

  async getHistoricalData(symbol: string, _range?: string): Promise<Candle[]> {
    return this.getProfile(symbol).candles;
  }

  async getNews(symbol: string): Promise<NewsArticle[]> {
    return this.getProfile(symbol).news;
  }

  async getMarketMovers(): Promise<MarketMover[]> {
    return Object.entries(PROFILES).map(([sym, profile]) => ({
      symbol: sym,
      price: profile.price,
      changePercent: profile.changePercent,
      volume: profile.volume,
      averageVolume: profile.averageVolume,
      signals: profile.signals ?? [],
    }));
  }

  private getProfile(symbol: string): SymbolProfile {
    const key = symbol.toUpperCase();
    const profile = PROFILES[key];
    if (!profile) {
      return defaultProfile(key);
    }
    return profile;
  }
}
