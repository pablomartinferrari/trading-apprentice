import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema.js";

export type AppDatabase = BetterSQLite3Database<typeof schema> & {
  close: () => void;
};

export function createDatabase(databasePath: string): AppDatabase {
  mkdirSync(dirname(databasePath), { recursive: true });
  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS trade_journal (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      thesis TEXT NOT NULL,
      ai_recommendation TEXT NOT NULL DEFAULT '',
      outcome TEXT NOT NULL,
      lessons_learned TEXT NOT NULL DEFAULT '',
      strategy_tag TEXT NOT NULL DEFAULT 'swing',
      recorded_at TEXT NOT NULL
    );
  `);

  const db = drizzle(sqlite, { schema });
  const appDb = db as unknown as AppDatabase;
  appDb.close = () => sqlite.close();
  return appDb;
}
