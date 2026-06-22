import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/estancia',
  });
  
  try {
    const [transactions] = await connection.query('SELECT * FROM petty_cash_transactions');
    console.log('Petty Cash Transactions:', transactions);
  } catch (e) {
    console.error(e);
  }
  await connection.end();
}

run();
