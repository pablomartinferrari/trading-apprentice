import type {
  AccountInfo,
  BrokeragePort,
  Order,
  OrderResult,
  Position,
} from "../../application/ports/BrokeragePort.js";
import { TradingDisabledError } from "../../shared/errors.js";

export class StubBrokerageAdapter implements BrokeragePort {
  private readonly tradingEnabled: boolean;

  constructor(tradingEnabled = false) {
    this.tradingEnabled = tradingEnabled;
  }

  async getAccount(): Promise<AccountInfo> {
    return {
      id: "stub-account-001",
      accountBalance: 10_000,
      buyingPower: 8_000,
      maxRiskPerTrade: 2,
      maxDailyLoss: 500,
    };
  }

  async getPositions(): Promise<Position[]> {
    return [
      {
        symbol: "AAPL",
        quantity: 10,
        averageCost: 175.0,
        currentPrice: 182.5,
      },
    ];
  }

  async placeOrder(_order: Order): Promise<OrderResult> {
    if (!this.tradingEnabled) {
      throw new TradingDisabledError();
    }

    return {
      orderId: `stub-order-${Date.now()}`,
      status: "submitted",
    };
  }

  async cancelOrder(_orderId: string): Promise<void> {
    if (!this.tradingEnabled) {
      throw new TradingDisabledError("Trading execution is disabled — cannot cancel orders");
    }
  }
}
