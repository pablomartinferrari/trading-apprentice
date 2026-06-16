import type { TradeJournal } from "../domain/journal/TradeJournal.js";
import type { JournalRepository } from "../application/ports/JournalRepository.js";

export class InMemoryJournalRepository implements JournalRepository {
  private entries = new Map<string, TradeJournal>();

  async save(entry: TradeJournal): Promise<TradeJournal> {
    this.entries.set(entry.id, entry);
    return entry;
  }

  async findAll(): Promise<TradeJournal[]> {
    return [...this.entries.values()].sort(
      (a, b) => b.recordedAt.getTime() - a.recordedAt.getTime(),
    );
  }

  async findById(id: string): Promise<TradeJournal | null> {
    return this.entries.get(id) ?? null;
  }

  clear(): void {
    this.entries.clear();
  }
}
