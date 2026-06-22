import Database from 'better-sqlite3';

const db = new Database('estancia.db', { verbose: console.log });

try {
  console.log('Iniciando migración Inventario-Finanzas...');
  
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

  // Add columns to inventory_movements
  addColumnSafe('inventory_movements', 'cost', 'REAL DEFAULT 0');
  addColumnSafe('inventory_movements', 'accountId', 'INTEGER REFERENCES finance_accounts(id)');

  // Add column to inventory
  addColumnSafe('inventory', 'lastPurchaseCost', 'REAL DEFAULT 0');

  db.exec('COMMIT;');
  console.log('Migración de Inventario completada exitosamente.');

} catch (error) {
  db.exec('ROLLBACK;');
  console.error('Error durante la migración:', error);
}
