const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'estancia.db');
const db = new Database(dbPath, { verbose: console.log });

db.pragma('foreign_keys = ON');

console.log('Migrando base de datos para Transporte y Documentos...');

try {
  db.exec('BEGIN TRANSACTION');

  // ==========================================
  // MODULO: TRANSPORTE ESCOLAR
  // ==========================================

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      plate TEXT UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT DEFAULT 'Activo', -- Activo, Mantenimiento, Inactivo
      insuranceExpiration DATE,
      registrationExpiration DATE,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      licenseNumber TEXT UNIQUE NOT NULL,
      licenseExpiration DATE,
      phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'Activo', -- Activo, Inactivo
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_monitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT,
      assignedRouteId INTEGER,
      status TEXT DEFAULT 'Activo',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sectors TEXT,
      departureTime TEXT,
      returnTime TEXT,
      vehicleId INTEGER,
      driverId INTEGER,
      status TEXT DEFAULT 'Activo',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicleId) REFERENCES transport_vehicles(id),
      FOREIGN KEY (driverId) REFERENCES transport_drivers(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_route_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routeId INTEGER NOT NULL,
      name TEXT NOT NULL,
      time TEXT,
      orderIndex INTEGER,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      childId INTEGER NOT NULL,
      routeId INTEGER NOT NULL,
      pickupAddress TEXT,
      dropoffAddress TEXT,
      specialSchedule TEXT,
      authorizedPerson TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignmentId INTEGER NOT NULL,
      date DATE NOT NULL,
      pickupStatus TEXT, -- Abordado, Ausente
      dropoffStatus TEXT, -- Entregado, Ausente
      notes TEXT,
      recordedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignmentId) REFERENCES transport_assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (recordedBy) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routeId INTEGER NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      reportedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE,
      FOREIGN KEY (reportedBy) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transport_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      date DATE NOT NULL,
      type TEXT NOT NULL, -- Combustible, Mantenimiento, Reparacion, Seguro, Otro
      amount REAL NOT NULL,
      description TEXT,
      recordedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicleId) REFERENCES transport_vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY (recordedBy) REFERENCES users(id)
    )
  `);

  // ==========================================
  // MODULO: GESTIÓN DOCUMENTAL
  // ==========================================

  db.exec(`
    CREATE TABLE IF NOT EXISTS document_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  // Insert default categories
  const categories = ['Estudiantes', 'Padres', 'Personal', 'Transporte', 'Finanzas', 'Inventario', 'Institucional'];
  const insertCat = db.prepare('INSERT OR IGNORE INTO document_categories (name) VALUES (?)');
  for (const cat of categories) {
    insertCat.run(cat);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      categoryId INTEGER NOT NULL,
      entityType TEXT, -- student, staff, institution, etc.
      entityId INTEGER, -- childId, staffId, etc.
      documentType TEXT, -- Acta de nacimiento, Cedula, Contrato, etc.
      fileUrl TEXT NOT NULL,
      fileType TEXT,
      fileSize INTEGER,
      expirationDate DATE,
      status TEXT DEFAULT 'Activo',
      uploadedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES document_categories(id),
      FOREIGN KEY (uploadedBy) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS document_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId INTEGER NOT NULL,
      fileUrl TEXT NOT NULL,
      fileType TEXT,
      fileSize INTEGER,
      versionNumber INTEGER NOT NULL,
      uploadedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (uploadedBy) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS document_access_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      action TEXT NOT NULL, -- viewed, downloaded, modified, approved
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS document_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId INTEGER NOT NULL,
      requestedBy INTEGER NOT NULL,
      approvedBy INTEGER,
      status TEXT DEFAULT 'Pendiente', -- Pendiente, Aprobado, Rechazado
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      approvedAt DATETIME,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (requestedBy) REFERENCES users(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    )
  `);

  db.exec('COMMIT');
  console.log('Migración completada exitosamente.');

} catch (error) {
  db.exec('ROLLBACK');
  console.error('Error durante la migración:', error);
}
