const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'estancia.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  db.exec('BEGIN TRANSACTION');

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Insert default centro settings if not already exists
  const existing = db.prepare("SELECT * FROM app_settings WHERE key = 'settings_centro'").get();
  if (!existing) {
    const defaultCentro = {
      nombre: "Nova Skill",
      rnc: "130-456789-1",
      direccion: "Av. Winston Churchill #45, Distrito Nacional",
      telefono: "(809) 555-0123",
      correo: "contacto@estanciakids.com",
      periodo: "2023 - 2024"
    };
    db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?)").run('settings_centro', JSON.stringify(defaultCentro));
  }

  db.exec('COMMIT');
  console.log('App settings table migration completed successfully!');
} catch (error) {
  db.exec('ROLLBACK');
  console.error('Error during migration:', error);
} finally {
  db.close();
}
