import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const tradeJournalTable = sqliteTable("trade_journal", {
  id: text("id").primaryKey(),
  symbol: text("symbol").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price").notNull(),
  quantity: integer("quantity").notNull(),
  thesis: text("thesis").notNull(),
  aiRecommendation: text("ai_recommendation").notNull().default(""),
  outcome: text("outcome").notNull(),
  lessonsLearned: text("lessons_learned").notNull().default(""),
  strategyTag: text("strategy_tag").notNull().default("swing"),
  recordedAt: text("recorded_at").notNull(),
});
