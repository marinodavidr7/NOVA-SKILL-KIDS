const db = require('better-sqlite3')('estancia.db');

try {
  // Alter children table
  try {
    db.exec('ALTER TABLE children ADD COLUMN dismissalReason TEXT');
    db.exec('ALTER TABLE children ADD COLUMN dismissalDate DATE');
    db.exec('ALTER TABLE children ADD COLUMN dismissalReport TEXT');
  } catch(e) { console.log('Columns may already exist', e.message); }

  // 11. ACTIVOS FIJOS - Mantenimiento
  db.exec(`
    CREATE TABLE IF NOT EXISTS asset_maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assetId INTEGER NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      cost REAL DEFAULT 0,
      technician TEXT,
      nextMaintenanceDate DATE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
    )
  `);

  // 13. RRHH - Asistencia
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER NOT NULL,
      date DATE NOT NULL,
      checkIn TIME,
      checkOut TIME,
      status TEXT DEFAULT 'present',
      notes TEXT,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    )
  `);

  // 13. RRHH - Vacaciones y Permisos
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER NOT NULL,
      type TEXT NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      reason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    )
  `);

  // 13. RRHH - Nómina
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_payroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER NOT NULL,
      periodStart DATE NOT NULL,
      periodEnd DATE NOT NULL,
      baseSalary REAL NOT NULL,
      bonuses REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      netPay REAL NOT NULL,
      paymentDate DATE,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    )
  `);

  console.log("Base de datos actualizada con éxito para Fase 2.");
} catch(e) {
  console.error("Error actualizando DB:", e);
}
