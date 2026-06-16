import type { TradeJournal } from "../../domain/journal/TradeJournal.js";

export interface JournalRepository {
  save(entry: TradeJournal): Promise<TradeJournal>;
  findAll(): Promise<TradeJournal[]>;
  findById(id: string): Promise<TradeJournal | null>;
}
