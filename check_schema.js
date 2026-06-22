const Database = require('better-sqlite3');
const db = new Database('estancia.db');

try {
  const schema = db.prepare("PRAGMA table_info(medical_records)").all();
  console.log("Schema:", schema);
} catch (e) {
  console.error(e);
}
