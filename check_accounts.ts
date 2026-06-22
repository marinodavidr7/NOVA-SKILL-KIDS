import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    uri: 'mysql://root:root@127.0.0.1:3306/estancia',
  });
  
  try {
    const [financeAccounts] = await connection.query('SELECT id, name FROM finance_accounts');
    console.log('Finance Accounts:', financeAccounts);
    
    const [pettyCashAccounts] = await connection.query('SELECT id, name FROM petty_cash');
    console.log('Petty Cash Accounts:', pettyCashAccounts);
  } catch (e) {
    console.error(e);
  }
  await connection.end();
}

run();
