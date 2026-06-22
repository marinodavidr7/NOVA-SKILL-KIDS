const Database = require('better-sqlite3');
const db = new Database('estancia.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staffId INTEGER,
    username TEXT UNIQUE NOT NULL,
    pin TEXT NOT NULL,
    role TEXT DEFAULT 'teacher',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
  )
`);

const exists = db.prepare(`SELECT 1 FROM users WHERE username = 'admin'`).get();
if (!exists) {
  db.prepare(`
    INSERT INTO users (username, pin, role) 
    VALUES ('admin', '1234', 'admin')
  `).run();
}

console.log('Database updated correctly.');
