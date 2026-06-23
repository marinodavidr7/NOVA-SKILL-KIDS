import * as mysql from 'mysql2/promise';

declare global {
  var mysqlPool: mysql.Pool | undefined;
}

const pool = globalThis.mysqlPool || mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/estancia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.mysqlPool = pool;
}

pool.on('connection', (connection) => {
  connection.query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");
});

export const db = pool;
export default db;
