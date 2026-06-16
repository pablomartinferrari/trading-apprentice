import { DomainError } from "../../shared/errors.js";
import { Money } from "./Money.js";
import { PositionSize } from "./PositionSize.js";

export interface OpenPosition {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
}

export interface ExposureSummary {
  totalPositionValue: number;
  positionCount: number;
  largestPositionSymbol: string | null;
  exposurePercent: number;
}

export interface TraderAccountProps {
  id: string;
  accountBalance: number;
  buyingPower: number;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  openPositions: OpenPosition[];
  dailyLossSoFar?: number;
}

export class TraderAccount {
  readonly id: string;
  readonly accountBalance: Money;
  readonly buyingPower: Money;
  readonly maxRiskPerTrade: number;
  readonly maxDailyLoss: Money;
  readonly openPositions: OpenPosition[];
  readonly dailyLossSoFar: Money;

  constructor(props: TraderAccountProps) {
    if (props.maxRiskPerTrade <= 0 || props.maxRiskPerTrade > 100) {
      throw new DomainError("Max risk per trade must be between 0 and 100");
    }

    this.id = props.id;
    this.accountBalance = new Money(props.accountBalance);
    this.buyingPower = new Money(props.buyingPower);
    this.maxRiskPerTrade = props.maxRiskPerTrade;
    this.maxDailyLoss = new Money(props.maxDailyLoss);
    this.openPositions = [...props.openPositions];
    this.dailyLossSoFar = new Money(props.dailyLossSoFar ?? 0);
  }

  calculatePositionSize(entryPrice: number, stopPrice: number): PositionSize {
    if (entryPrice <= 0 || stopPrice <= 0) {
      throw new DomainError("Entry and stop prices must be positive");
    }

    const riskPerShare = Math.abs(entryPrice - stopPrice);
    if (riskPerShare === 0) {
      throw new DomainError("Stop price must differ from entry price");
    }

    const maxDollarRisk =
      this.accountBalance.amount * (this.maxRiskPerTrade / 100);
    const shares = Math.floor(maxDollarRisk / riskPerShare);

    return new PositionSize(shares);
  }

  validateRisk(proposedLoss: number): void {
    if (proposedLoss < 0) {
      throw new DomainError("Proposed loss cannot be negative");
    }

    const maxTradeLoss =
      this.accountBalance.amount * (this.maxRiskPerTrade / 100);

    if (proposedLoss > maxTradeLoss) {
      throw new DomainError(
        `Proposed loss $${proposedLoss.toFixed(2)} exceeds max per-trade risk $${maxTradeLoss.toFixed(2)}`,
      );
    }

    const remainingDailyBudget =
      this.maxDailyLoss.amount - this.dailyLossSoFar.amount;

    if (proposedLoss > remainingDailyBudget) {
      throw new DomainError(
        `Proposed loss $${proposedLoss.toFixed(2)} exceeds remaining daily loss budget $${remainingDailyBudget.toFixed(2)}`,
      );
    }
  }

  evaluateExposure(): ExposureSummary {
    const totalPositionValue = this.openPositions.reduce(
      (sum, pos) => sum + pos.quantity * pos.currentPrice,
      0,
    );

    let largestPositionSymbol: string | null = null;
    let largestValue = 0;

    for (const pos of this.openPositions) {
      const value = pos.quantity * pos.currentPrice;
      if (value > largestValue) {
        largestValue = value;
        largestPositionSymbol = pos.symbol;
      }
    }

    const exposurePercent =
      this.accountBalance.amount > 0
        ? (totalPositionValue / this.accountBalance.amount) * 100
        : 0;

    return {
      totalPositionValue,
      positionCount: this.openPositions.length,
      largestPositionSymbol,
      exposurePercent,
    };
  }
}
