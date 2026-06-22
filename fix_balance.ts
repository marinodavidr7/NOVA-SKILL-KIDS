import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/estancia',
  });
  
  try {
    await connection.query('UPDATE petty_cash SET balance = (SELECT balance FROM finance_accounts WHERE id = 3) WHERE id = 1');
    console.log('Synced petty cash balance to match finance account');
  } catch (e) {
    console.error(e);
  }
  await connection.end();
}

run();
