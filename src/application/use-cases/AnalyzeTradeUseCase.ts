import type {
  AnalyzeTradeInput,
  AnalyzeTradeOutput,
} from "../dto/index.js";
import type { AIAnalysisPort } from "../ports/AIAnalysisPort.js";
import type { BrokeragePort } from "../ports/BrokeragePort.js";
import type { MarketDataPort } from "../ports/MarketDataPort.js";

export class AnalyzeTradeUseCase {
  constructor(
    private readonly marketData: MarketDataPort,
    private readonly aiAnalysis: AIAnalysisPort,
    private readonly brokerage?: BrokeragePort,
  ) {}

  async execute(input: AnalyzeTradeInput): Promise<AnalyzeTradeOutput> {
    const symbol = input.symbol.toUpperCase();

    const [quote, candles, news] = await Promise.all([
      this.marketData.getQuote(symbol),
      this.marketData.getHistoricalData(symbol),
      this.marketData.getNews(symbol),
    ]);

    let accountContext;
    if (this.brokerage) {
      const [account, positions] = await Promise.all([
        this.brokerage.getAccount(),
        this.brokerage.getPositions(),
      ]);
      accountContext = {
        balance: account.accountBalance,
        buyingPower: account.buyingPower,
        openPositions: positions.map((p) => ({
          symbol: p.symbol,
          quantity: p.quantity,
          averageCost: p.averageCost,
        })),
      };
    }

    const recommendation = await this.aiAnalysis.analyzeTrade({
      symbol,
      desiredEntryPrice: input.desiredEntryPrice,
      quote,
      candles,
      news,
      accountContext,
    });

    return { recommendation };
  }
}
