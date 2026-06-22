const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'estancia.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  // Check if column exists
  const tableInfo = db.pragma('table_info(users)');
  const hasPermissions = tableInfo.some(col => col.name === 'permissions');
  
  if (!hasPermissions) {
    console.log('Adding permissions column to users table...');
    db.exec(`ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '{}'`);
    console.log('Column added successfully.');
  } else {
    console.log('Permissions column already exists.');
  }
} catch (error) {
  console.error('Error modifying database:', error);
} finally {
  db.close();
}
