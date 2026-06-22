const db = require('better-sqlite3')('estancia.db');
const txs = db.prepare("SELECT * FROM finance_transactions WHERE type='out' AND category='Inventario' AND relatedId NOT IN (SELECT id FROM expenses WHERE category='Inventario')").all();

console.log('Found transactions:', txs.length);

for(const tx of txs) {
  const info = db.prepare("INSERT INTO expenses (category, subcategory, amount, description, date, accountId, status) VALUES ('Inventario', NULL, ?, ?, ?, ?, 'paid')").run(tx.amount, tx.description, tx.date, tx.accountId);
  db.prepare("UPDATE finance_transactions SET relatedId = ? WHERE id = ?").run(info.lastInsertRowid, tx.id);
}

console.log('Fixed ' + txs.length + ' transactions');
