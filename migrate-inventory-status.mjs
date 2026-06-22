import Database from 'better-sqlite3';

const db = new Database('estancia.db', { verbose: console.log });

try {
  console.log('Iniciando migración Inventario Status...');
  
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

  // Add column to inventory
  addColumnSafe('inventory', 'status', "TEXT DEFAULT 'active'");

  db.exec('COMMIT;');
  console.log('Migración de Inventario completada exitosamente.');

} catch (error) {
  db.exec('ROLLBACK;');
  console.error('Error durante la migración:', error);
}
