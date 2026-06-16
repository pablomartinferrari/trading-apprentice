export interface AccountInfo {
  id: string;
  accountBalance: number;
  buyingPower: number;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
}

export interface Order {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  orderType: "market" | "limit";
  limitPrice?: number;
}

export interface OrderResult {
  orderId: string;
  status: string;
}

export interface BrokeragePort {
  getAccount(): Promise<AccountInfo>;
  getPositions(): Promise<Position[]>;
  placeOrder(order: Order): Promise<OrderResult>;
  cancelOrder(orderId: string): Promise<void>;
}
