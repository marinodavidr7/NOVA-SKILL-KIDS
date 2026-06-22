import Database from 'better-sqlite3';

const db = new Database('estancia.db', { verbose: console.log });

try {
  console.log('Iniciando migración ERP Financiero...');
  
  db.exec('BEGIN TRANSACTION;');

  // 1. Cuentas y Bancos
  db.exec(`
    CREATE TABLE IF NOT EXISTS finance_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'bank', 'cash'
      currency TEXT DEFAULT 'DOP',
      balance REAL DEFAULT 0,
      accountNumber TEXT,
      bankName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insertar una cuenta de caja por defecto si no hay cuentas
  const accountsCount = db.prepare('SELECT COUNT(*) as count FROM finance_accounts').get().count;
  if (accountsCount === 0) {
    db.prepare(`
      INSERT INTO finance_accounts (name, type, currency, balance, bankName) 
      VALUES ('Caja General', 'cash', 'DOP', 0, 'Efectivo Físico')
    `).run();
  }

  // 2. Transacciones (Movimientos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS finance_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'in', 'out', 'transfer'
      amount REAL NOT NULL,
      date DATE NOT NULL,
      reference TEXT,
      description TEXT,
      category TEXT,
      relatedId INTEGER, -- ID de income o expense si aplica
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (accountId) REFERENCES finance_accounts(id) ON DELETE CASCADE
    );
  `);

  // 3. Préstamos
  db.exec(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lender TEXT NOT NULL,
      amount REAL NOT NULL,
      interestRate REAL DEFAULT 0,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status TEXT DEFAULT 'active', -- 'active', 'paid'
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Pagos de Préstamos
  db.exec(`
    CREATE TABLE IF NOT EXISTS loan_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loanId INTEGER NOT NULL,
      accountId INTEGER,
      amount REAL NOT NULL,
      principal REAL DEFAULT 0,
      interest REAL DEFAULT 0,
      date DATE NOT NULL,
      reference TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loanId) REFERENCES loans(id) ON DELETE CASCADE,
      FOREIGN KEY (accountId) REFERENCES finance_accounts(id)
    );
  `);

  // 5. Presupuestos
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      period TEXT NOT NULL, -- YYYY-MM
      estimatedAmount REAL NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, period)
    );
  `);

  // 6. Caja Chica
  db.exec(`
    CREATE TABLE IF NOT EXISTS petty_cash (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      custodian TEXT NOT NULL,
      balance REAL DEFAULT 0,
      cashLimit REAL DEFAULT 5000,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insertar caja chica por defecto
  const pettyCount = db.prepare('SELECT COUNT(*) as count FROM petty_cash').get().count;
  if (pettyCount === 0) {
    db.prepare(`
      INSERT INTO petty_cash (name, custodian, balance, cashLimit) 
      VALUES ('Caja Chica Principal', 'Administración', 0, 5000)
    `).run();
  }

  // 7. Transacciones de Caja Chica
  db.exec(`
    CREATE TABLE IF NOT EXISTS petty_cash_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pettyCashId INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'replenish', 'expense'
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      receiptUrl TEXT,
      date DATE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pettyCashId) REFERENCES petty_cash(id) ON DELETE CASCADE
    );
  `);

  // 8. Modificar Tablas Existentes (Intentar añadir columnas de forma segura)
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

  // Mejoras a Ingresos
  addColumnSafe('income', 'accountId', 'INTEGER REFERENCES finance_accounts(id)');
  addColumnSafe('income', 'status', "TEXT DEFAULT 'paid'");
  addColumnSafe('income', 'dueDate', 'DATE');
  addColumnSafe('income', 'invoiceNumber', 'TEXT');

  // Mejoras a Gastos
  addColumnSafe('expenses', 'accountId', 'INTEGER REFERENCES finance_accounts(id)');
  addColumnSafe('expenses', 'status', "TEXT DEFAULT 'paid'");
  addColumnSafe('expenses', 'receiptUrl', 'TEXT');
  addColumnSafe('expenses', 'dueDate', 'DATE');

  db.exec('COMMIT;');
  console.log('Migración completada exitosamente.');

} catch (error) {
  db.exec('ROLLBACK;');
  console.error('Error durante la migración:', error);
}
