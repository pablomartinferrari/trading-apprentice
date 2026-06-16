import { TraderAccount } from "../../domain/trader/TraderAccount.js";
import type {
  CalculatePositionSizeInput,
  CalculatePositionSizeOutput,
} from "../dto/index.js";
import type { BrokeragePort } from "../ports/BrokeragePort.js";

export class CalculatePositionSizeUseCase {
  constructor(private readonly brokerage?: BrokeragePort) {}

  async execute(
    input: CalculatePositionSizeInput,
  ): Promise<CalculatePositionSizeOutput> {
    let accountBalance = input.accountBalance;
    let maxRiskPerTrade = input.riskPercent;

    if (this.brokerage) {
      const account = await this.brokerage.getAccount();
      accountBalance = accountBalance ?? account.accountBalance;
      maxRiskPerTrade = maxRiskPerTrade ?? account.maxRiskPerTrade;
    }

    if (accountBalance === undefined) {
      throw new Error("Account balance is required");
    }

    if (maxRiskPerTrade === undefined) {
      throw new Error("Risk percent is required");
    }

    const account = new TraderAccount({
      id: "position-sizing",
      accountBalance,
      buyingPower: accountBalance,
      maxRiskPerTrade,
      maxDailyLoss: accountBalance * 0.05,
      openPositions: [],
    });

    const positionSize = account.calculatePositionSize(
      input.entryPrice,
      input.stopPrice,
    );

    const riskPerShare = Math.abs(input.entryPrice - input.stopPrice);
    const maxLoss = positionSize.shares * riskPerShare;

    return {
      maxShares: positionSize.shares,
      maxLoss,
      riskPerShare,
    };
  }
}
