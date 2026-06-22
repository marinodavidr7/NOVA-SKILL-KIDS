const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'estancia.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  // 1. Begin transaction
  db.exec('BEGIN TRANSACTION');

  // 2. Create new users table
  db.exec(`
    CREATE TABLE users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      pin TEXT,
      role TEXT DEFAULT 'teacher',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    )
  `);

  // 3. Copy data, using the existing pin as the temporary password if password is required, or just a default password
  // Let's set 'admin123' for admin, and 'temporal123' for others. Keep the existing pin.
  db.exec(`
    INSERT INTO users_new (id, staffId, username, password, pin, role, createdAt)
    SELECT 
      id, staffId, username, 
      CASE WHEN username = 'admin' THEN 'admin123' ELSE 'temporal123' END as password,
      pin, role, createdAt
    FROM users
  `);

  // 4. Drop old table
  db.exec('DROP TABLE users');

  // 5. Rename new table
  db.exec('ALTER TABLE users_new RENAME TO users');

  // 6. Commit
  db.exec('COMMIT');
  
  console.log('Migración completada con éxito.');
} catch (error) {
  db.exec('ROLLBACK');
  console.error('Error durante la migración:', error);
}

db.close();
