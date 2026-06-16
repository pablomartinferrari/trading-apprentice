import { WatchlistCandidate } from "../../domain/watchlist/WatchlistCandidate.js";
import type {
  GenerateWatchlistInput,
  GenerateWatchlistOutput,
} from "../dto/index.js";
import type { MarketDataPort } from "../ports/MarketDataPort.js";
import type { WatchlistSignal } from "../../domain/watchlist/WatchlistCandidate.js";

const SIGNAL_REASONS: Record<string, { signal: WatchlistSignal; reason: string }> = {
  gap_up: {
    signal: "gap_up",
    reason: "Opened significantly above prior close",
  },
  gap_down: {
    signal: "gap_down",
    reason: "Opened significantly below prior close",
  },
  high_rvol: {
    signal: "high_rvol",
    reason: "Volume is elevated relative to average",
  },
  earnings: {
    signal: "earnings",
    reason: "Earnings announcement scheduled or recent",
  },
  news_catalyst: {
    signal: "news_catalyst",
    reason: "Recent news may act as a catalyst",
  },
  unusual_activity: {
    signal: "unusual_activity",
    reason: "Unusual price/volume activity detected",
  },
};

export class GenerateWatchlistUseCase {
  constructor(private readonly marketData: MarketDataPort) {}

  async execute(input: GenerateWatchlistInput): Promise<GenerateWatchlistOutput> {
    if (input.market !== "US") {
      throw new Error("Only US market is supported");
    }

    const movers = await this.marketData.getMarketMovers();

    const candidates = movers.map((mover) => {
      const signals: WatchlistSignal[] = [];
      const reasons: string[] = [];

      for (const rawSignal of mover.signals) {
        const mapped = SIGNAL_REASONS[rawSignal];
        if (mapped) {
          signals.push(mapped.signal);
          reasons.push(mapped.reason);
        }
      }

      if (mover.changePercent > 3) {
        reasons.push(`Up ${mover.changePercent.toFixed(1)}% today — momentum in play`);
      } else if (mover.changePercent < -3) {
        reasons.push(`Down ${Math.abs(mover.changePercent).toFixed(1)}% today — potential reversal or continuation setup`);
      }

      const rvol = mover.averageVolume > 0 ? mover.volume / mover.averageVolume : 1;
      if (rvol > 1.5) {
        reasons.push(`Relative volume ${rvol.toFixed(1)}x average`);
      }

      return new WatchlistCandidate({
        symbol: mover.symbol,
        signals,
        reasons,
      });
    });

    return { candidates };
  }
}
