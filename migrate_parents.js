const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'estancia.db');
const db = new Database(dbPath);

try {
  db.exec('ALTER TABLE parents ADD COLUMN photoUrl TEXT;');
  console.log('Successfully added photoUrl to parents table.');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('photoUrl column already exists in parents table.');
  } else {
    console.error('Error adding column:', error);
  }
}
