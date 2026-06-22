import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'estancia.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  db.exec(`
    ALTER TABLE staff ADD COLUMN dni TEXT;
    ALTER TABLE staff ADD COLUMN birthDate DATE;
    ALTER TABLE staff ADD COLUMN address TEXT;
    ALTER TABLE staff ADD COLUMN emergencyName TEXT;
    ALTER TABLE staff ADD COLUMN emergencyPhone TEXT;
    ALTER TABLE staff ADD COLUMN emergencyRelation TEXT;
    ALTER TABLE staff ADD COLUMN bankName TEXT;
    ALTER TABLE staff ADD COLUMN bankAccount TEXT;
  `);
  console.log("Migration successful!");
} catch (e) {
  console.log("Migration skipped or failed:", e.message);
}
