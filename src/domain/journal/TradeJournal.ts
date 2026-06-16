import { DomainError } from "../../shared/errors.js";

export type StrategyTag = "breakout" | "momentum" | "news" | "swing";
export type TradeOutcome = "win" | "loss" | "breakeven";

export interface TradeJournalProps {
  id?: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  thesis: string;
  aiRecommendation?: string;
  outcome?: TradeOutcome;
  lessonsLearned?: string;
  strategyTag?: StrategyTag;
  recordedAt?: Date;
}

export class TradeJournal {
  readonly id: string;
  readonly symbol: string;
  readonly entryPrice: number;
  readonly exitPrice: number;
  readonly quantity: number;
  readonly thesis: string;
  readonly aiRecommendation: string;
  readonly outcome: TradeOutcome;
  readonly lessonsLearned: string;
  readonly strategyTag: StrategyTag;
  readonly recordedAt: Date;

  constructor(props: TradeJournalProps) {
    if (props.entryPrice <= 0 || props.exitPrice <= 0) {
      throw new DomainError("Entry and exit prices must be positive");
    }
    if (props.quantity <= 0 || !Number.isInteger(props.quantity)) {
      throw new DomainError("Quantity must be a positive integer");
    }
    if (!props.thesis.trim()) {
      throw new DomainError("Thesis is required");
    }

    this.id = props.id ?? crypto.randomUUID();
    this.symbol = props.symbol.toUpperCase();
    this.entryPrice = props.entryPrice;
    this.exitPrice = props.exitPrice;
    this.quantity = props.quantity;
    this.thesis = props.thesis;
    this.aiRecommendation = props.aiRecommendation ?? "";
    this.lessonsLearned = props.lessonsLearned ?? "";
    this.strategyTag = props.strategyTag ?? "swing";
    this.recordedAt = props.recordedAt ?? new Date();
    this.outcome = props.outcome ?? this.deriveOutcome();
  }

  calculatePnL(): number {
    return (this.exitPrice - this.entryPrice) * this.quantity;
  }

  calculateReturn(): number {
    const costBasis = this.entryPrice * this.quantity;
    if (costBasis === 0) return 0;
    return (this.calculatePnL() / costBasis) * 100;
  }

  private deriveOutcome(): TradeOutcome {
    const pnl = (this.exitPrice - this.entryPrice) * this.quantity;
    if (pnl > 0) return "win";
    if (pnl < 0) return "loss";
    return "breakeven";
  }
}
