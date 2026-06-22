const db = require('better-sqlite3')('estancia.db');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => {
  console.log(t.name);
  console.log(t.sql);
  console.log('---');
});
