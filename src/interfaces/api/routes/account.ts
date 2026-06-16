import { Hono } from "hono";
import type { AppDependencies } from "../composition-root.js";
import { TraderAccount } from "../../../domain/trader/TraderAccount.js";

export function createAccountRoutes(deps: AppDependencies) {
  const app = new Hono();

  app.get("/", async (c) => {
    const [account, positions] = await Promise.all([
      deps.brokerage.getAccount(),
      deps.brokerage.getPositions(),
    ]);

    const traderAccount = new TraderAccount({
      id: account.id,
      accountBalance: account.accountBalance,
      buyingPower: account.buyingPower,
      maxRiskPerTrade: account.maxRiskPerTrade,
      maxDailyLoss: account.maxDailyLoss,
      openPositions: positions,
    });

    const exposure = traderAccount.evaluateExposure();

    return c.json({
      account: {
        id: account.id,
        accountBalance: account.accountBalance,
        buyingPower: account.buyingPower,
        maxRiskPerTrade: account.maxRiskPerTrade,
        maxDailyLoss: account.maxDailyLoss,
      },
      positions,
      exposure,
    });
  });

  return app;
}
