const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection('mysql://root:root@localhost:3306/estancia');
  
  const [tables] = await conn.query('SHOW TABLES');
  console.log('ALL TABLES:', JSON.stringify(tables));
  
  const [accounts] = await conn.query('SELECT * FROM finance_accounts LIMIT 5');
  console.log('FINANCE ACCOUNTS:', JSON.stringify(accounts));
  
  conn.end();
}

check().catch(e => console.error('ERROR:', e.message));
