const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'estancia.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  db.exec('BEGIN TRANSACTION');

  // Add columns to users if they don't exist
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const columns = tableInfo.map(c => c.name);

  if (!columns.includes('firstName')) {
    db.exec('ALTER TABLE users ADD COLUMN firstName TEXT');
  }
  if (!columns.includes('lastName')) {
    db.exec('ALTER TABLE users ADD COLUMN lastName TEXT');
  }
  if (!columns.includes('email')) {
    db.exec('ALTER TABLE users ADD COLUMN email TEXT');
  }
  if (!columns.includes('avatar')) {
    db.exec('ALTER TABLE users ADD COLUMN avatar TEXT');
  }
  if (!columns.includes('title')) {
    db.exec('ALTER TABLE users ADD COLUMN title TEXT');
  }

  // Update existing admin user
  const admin = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  if (admin) {
    db.prepare(`
      UPDATE users 
      SET 
        firstName = COALESCE(firstName, 'María'), 
        lastName = COALESCE(lastName, 'García'), 
        email = COALESCE(email, 'admin@estanciakids.com'), 
        avatar = COALESCE(avatar, '/avatar-maria.jpg'),
        title = COALESCE(title, 'Directora')
      WHERE username = 'admin'
    `).run();
  }

  db.exec('COMMIT');
  console.log('Migration to add profile fields to users table completed successfully!');
} catch (error) {
  db.exec('ROLLBACK');
  console.error('Error during migration:', error);
} finally {
  db.close();
}
