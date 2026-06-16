export type WatchlistSignal =
  | "gap_up"
  | "gap_down"
  | "high_rvol"
  | "earnings"
  | "news_catalyst"
  | "unusual_activity";

export interface WatchlistCandidateProps {
  symbol: string;
  reasons: string[];
  signals: WatchlistSignal[];
  scannedAt?: Date;
}

export class WatchlistCandidate {
  readonly symbol: string;
  readonly reasons: string[];
  readonly signals: WatchlistSignal[];
  readonly scannedAt: Date;

  constructor(props: WatchlistCandidateProps) {
    this.symbol = props.symbol.toUpperCase();
    this.reasons = [...props.reasons];
    this.signals = [...props.signals];
    this.scannedAt = props.scannedAt ?? new Date();
  }
}
