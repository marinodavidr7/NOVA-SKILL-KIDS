import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/estancia',
  });
  
  try {
    const [rows] = await connection.query(`
      SELECT 
        table_schema AS db_name,
        ROUND(SUM(data_length + index_length) / 1024, 2) AS size_kb,
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.TABLES 
      WHERE table_schema = 'estancia'
      GROUP BY table_schema;
    `) as any[];

    console.log(rows[0]);

  } catch (e) {
    console.error('Error checking database size:', e);
  } finally {
    await connection.end();
  }
}

run();
