const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'estancia.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  // Get all tables
  const tables = db.pragma('table_list');
  const tableNames = tables
    .map(t => t.name)
    .filter(name => !name.startsWith('sqlite_') && name !== 'app_settings'); // Don't touch settings

  db.pragma('foreign_keys = OFF'); // Disable foreign keys first
  db.exec('BEGIN TRANSACTION');

  // Find admin staffId
  const adminUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  const adminStaffId = adminUser ? adminUser.staffId : null;

  for (const table of tableNames) {
    if (table === 'users') {
      db.prepare("DELETE FROM users WHERE username != 'admin'").run();
    } else if (table === 'staff') {
      if (adminStaffId) {
        db.prepare("DELETE FROM staff WHERE id != ?").run(adminStaffId);
      } else {
        db.prepare("DELETE FROM staff").run();
      }
    } else {
      db.prepare(`DELETE FROM ${table}`).run();
    }
  }

  db.pragma('foreign_keys = ON'); // Re-enable foreign keys
  db.exec('COMMIT');
  
  // Compact database
  db.exec('VACUUM');
  
  console.log('Database successfully cleaned. Only admin remains.');
} catch (error) {
  db.exec('ROLLBACK');
  db.pragma('foreign_keys = ON');
  console.error('Error cleaning database:', error);
} finally {
  db.close();
}
