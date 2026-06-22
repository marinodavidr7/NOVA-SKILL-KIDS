import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'estancia.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  db.exec(`
    ALTER TABLE income ADD COLUMN period TEXT;
  `);
  console.log("Migration successful!");
} catch (e) {
  console.log("Migration skipped or failed:", e.message);
}
