import { TradeJournal } from "../../domain/journal/TradeJournal.js";
import type { RecordTradeInput, RecordTradeOutput } from "../dto/index.js";
import type { JournalRepository } from "../ports/JournalRepository.js";

export class RecordTradeUseCase {
  constructor(private readonly journalRepository: JournalRepository) {}

  async execute(input: RecordTradeInput): Promise<RecordTradeOutput> {
    const entry = new TradeJournal({
      symbol: input.symbol,
      entryPrice: input.entryPrice,
      exitPrice: input.exitPrice,
      quantity: input.quantity,
      thesis: input.thesis,
      aiRecommendation: input.aiRecommendation,
      outcome: input.outcome,
      lessonsLearned: input.lessonsLearned,
      strategyTag: input.strategyTag,
    });

    const saved = await this.journalRepository.save(entry);
    return { entry: saved };
  }
}
