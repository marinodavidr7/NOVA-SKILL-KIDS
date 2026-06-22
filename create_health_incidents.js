const Database = require('better-sqlite3');
const db = new Database('estancia.db', { verbose: console.log });

db.exec(`
CREATE TABLE IF NOT EXISTS health_incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  childId INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  resolvedDate TEXT,
  resolutionNotes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
);
`);
console.log("health_incidents table created");
