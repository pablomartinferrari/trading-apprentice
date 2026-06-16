import { ConfidenceScore } from "./ConfidenceScore.js";
import { RiskScore } from "./RiskScore.js";

export type RecommendationAction = "buy" | "hold" | "avoid";
export type RiskLevel = "low" | "medium" | "high";
export type RecommendationStatus = "pending" | "approved" | "rejected";

export interface TradeRecommendationProps {
  symbol: string;
  bullishFactors: string[];
  bearishFactors: string[];
  confidenceScore: number;
  riskLevel: RiskLevel;
  riskScore: number;
  suggestedEntry: number;
  suggestedStopLoss: number;
  suggestedPositionSize: number;
  recommendation: RecommendationAction;
  generatedAt?: Date;
  status?: RecommendationStatus;
}

export class TradeRecommendation {
  readonly symbol: string;
  readonly bullishFactors: string[];
  readonly bearishFactors: string[];
  readonly confidenceScore: ConfidenceScore;
  readonly riskLevel: RiskLevel;
  readonly riskScore: RiskScore;
  readonly suggestedEntry: number;
  readonly suggestedStopLoss: number;
  readonly suggestedPositionSize: number;
  readonly recommendation: RecommendationAction;
  readonly generatedAt: Date;
  private _status: RecommendationStatus;

  constructor(props: TradeRecommendationProps) {
    this.symbol = props.symbol.toUpperCase();
    this.bullishFactors = [...props.bullishFactors];
    this.bearishFactors = [...props.bearishFactors];
    this.confidenceScore = new ConfidenceScore(props.confidenceScore);
    this.riskLevel = props.riskLevel;
    this.riskScore = new RiskScore(props.riskScore);
    this.suggestedEntry = props.suggestedEntry;
    this.suggestedStopLoss = props.suggestedStopLoss;
    this.suggestedPositionSize = props.suggestedPositionSize;
    this.recommendation = props.recommendation;
    this.generatedAt = props.generatedAt ?? new Date();
    this._status = props.status ?? "pending";
  }

  get status(): RecommendationStatus {
    return this._status;
  }

  approve(): void {
    this._status = "approved";
  }

  reject(): void {
    this._status = "rejected";
  }

  recalculate(): TradeRecommendation {
    return new TradeRecommendation({
      symbol: this.symbol,
      bullishFactors: this.bullishFactors,
      bearishFactors: this.bearishFactors,
      confidenceScore: this.confidenceScore.value,
      riskLevel: this.riskLevel,
      riskScore: this.riskScore.value,
      suggestedEntry: this.suggestedEntry,
      suggestedStopLoss: this.suggestedStopLoss,
      suggestedPositionSize: this.suggestedPositionSize,
      recommendation: this.recommendation,
      generatedAt: new Date(),
      status: "pending",
    });
  }
}
