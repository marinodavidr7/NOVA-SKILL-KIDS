import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/estancia',
  });
  
  try {
    const [tables] = await connection.query('SHOW TABLES') as any[];
    const dbName = Object.values(tables[0])[0]; // Not really dbName, it's the key 'Tables_in_estancia'
    const tableKey = Object.keys(tables[0])[0];

    console.log(`--- DATABASE HEALTH CHECK ---`);
    console.log(`Total Tables: ${tables.length}`);
    
    let totalRows = 0;
    const tableStats = [];

    for (const row of tables) {
      const tableName = row[tableKey];
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`) as any[];
      const count = countResult[0].count;
      tableStats.push({ table: tableName, count });
      totalRows += count;
    }

    // Sort by count descending
    tableStats.sort((a, b) => b.count - a.count);
    
    console.table(tableStats);
    console.log(`\nTotal Records across all tables: ${totalRows}`);

  } catch (e) {
    console.error('Error checking database:', e);
  } finally {
    await connection.end();
  }
}

run();
