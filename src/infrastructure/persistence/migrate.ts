import { createDatabase } from "./db.js";

const databasePath = process.env.DATABASE_PATH ?? "./data/trading-apprentice.db";

createDatabase(databasePath);
console.log(`Database migrated at ${databasePath}`);
