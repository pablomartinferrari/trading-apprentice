import { eq } from "drizzle-orm";
import { TradeJournal } from "../../domain/journal/TradeJournal.js";
import type { JournalRepository } from "../../application/ports/JournalRepository.js";
import type { AppDatabase } from "./db.js";
import { tradeJournalTable } from "./schema.js";

export class SQLiteJournalRepository implements JournalRepository {
  constructor(private readonly db: AppDatabase) {}

  async save(entry: TradeJournal): Promise<TradeJournal> {
    await this.db
      .insert(tradeJournalTable)
      .values({
        id: entry.id,
        symbol: entry.symbol,
        entryPrice: entry.entryPrice,
        exitPrice: entry.exitPrice,
        quantity: entry.quantity,
        thesis: entry.thesis,
        aiRecommendation: entry.aiRecommendation,
        outcome: entry.outcome,
        lessonsLearned: entry.lessonsLearned,
        strategyTag: entry.strategyTag,
        recordedAt: entry.recordedAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: tradeJournalTable.id,
        set: {
          symbol: entry.symbol,
          entryPrice: entry.entryPrice,
          exitPrice: entry.exitPrice,
          quantity: entry.quantity,
          thesis: entry.thesis,
          aiRecommendation: entry.aiRecommendation,
          outcome: entry.outcome,
          lessonsLearned: entry.lessonsLearned,
          strategyTag: entry.strategyTag,
          recordedAt: entry.recordedAt.toISOString(),
        },
      });

    return entry;
  }

  async findAll(): Promise<TradeJournal[]> {
    const rows = await this.db.select().from(tradeJournalTable);
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<TradeJournal | null> {
    const rows = await this.db
      .select()
      .from(tradeJournalTable)
      .where(eq(tradeJournalTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  private toDomain(row: typeof tradeJournalTable.$inferSelect): TradeJournal {
    return new TradeJournal({
      id: row.id,
      symbol: row.symbol,
      entryPrice: row.entryPrice,
      exitPrice: row.exitPrice,
      quantity: row.quantity,
      thesis: row.thesis,
      aiRecommendation: row.aiRecommendation,
      outcome: row.outcome as "win" | "loss" | "breakeven",
      lessonsLearned: row.lessonsLearned,
      strategyTag: row.strategyTag as "breakout" | "momentum" | "news" | "swing",
      recordedAt: new Date(row.recordedAt),
    });
  }
}
