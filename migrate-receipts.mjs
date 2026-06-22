import Database from 'better-sqlite3';

const db = new Database('estancia.db', { verbose: console.log });

try {
  console.log('Iniciando migración Receipt URLs...');
  
  db.exec('BEGIN TRANSACTION;');

  const addColumnSafe = (table, column, definition) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Columna ${column} añadida a ${table}`);
    } catch(e) {
      if (!e.message.includes('duplicate column')) {
        console.error(`Error añadiendo ${column} a ${table}:`, e.message);
      }
    }
  };

  addColumnSafe('inventory_movements', 'receiptUrl', 'TEXT');
  addColumnSafe('finance_transactions', 'receiptUrl', 'TEXT');

  db.exec('COMMIT;');
  console.log('Migración completada exitosamente.');

} catch (error) {
  db.exec('ROLLBACK;');
  console.error('Error durante la migración:', error);
}
