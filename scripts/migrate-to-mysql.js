const fs = require('fs');
const path = require('path');

const dir = 'src/lib/actions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Convert named parameters @param to :param inside queries
  // Only where preceded by a space, comma, parenthesis or equals sign
  content = content.replace(/([=,\(\s])@([a-zA-Z0-9_]+)/g, '$1:$2');

  // Change import
  content = content.replace(/import db from ['"]@\/lib\/db['"];?/g, "import { db } from '@/lib/db';");

  // Replace one-liners: const X = db.prepare(`...`).get(...) as any;
  // db.prepare(Q).get(args) -> (await db.query(Q, args))[0][0]
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.get\((.*?)\)/g, '(await db.query($1, $2))[0][0]');
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.get\(\)/g, '(await db.query($1))[0][0]');

  // db.prepare(Q).all(args) -> (await db.query(Q, args))[0]
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.all\((.*?)\)/g, '(await db.query($1, $2))[0]');
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.all\(\)/g, '(await db.query($1))[0]');

  // db.prepare(Q).run(args) -> (await db.execute(Q, args))[0]
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.run\((.*?)\)/g, '(await db.execute($1, $2))[0]');
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.run\(\)/g, '(await db.execute($1))[0]');

  // Handle multi-line statements with const stmt
  // const stmt = db.prepare(`...`);
  // return stmt.all(args);
  content = content.replace(/const\s+(\w+)\s*=\s*db\.prepare\(([\s\S]*?)\);/g, 'const $1_sql = $2;');
  content = content.replace(/(\w+)\.all\((.*?)\)/g, '(await db.query($1_sql, $2))[0]');
  content = content.replace(/(\w+)\.all\(\)/g, '(await db.query($1_sql))[0]');
  
  content = content.replace(/(\w+)\.get\((.*?)\)/g, '(await db.query($1_sql, $2))[0][0]');
  content = content.replace(/(\w+)\.get\(\)/g, '(await db.query($1_sql))[0][0]');
  
  content = content.replace(/(\w+)\.run\((.*?)\)/g, '(await db.execute($1_sql, $2))[0]');
  content = content.replace(/(\w+)\.run\(\)/g, '(await db.execute($1_sql))[0]');

  // Handle insertId
  content = content.replace(/\.lastInsertRowid/g, '.insertId');

  // Handle db.exec -> await db.query
  content = content.replace(/db\.exec\((.*?)\)/g, 'await db.query($1)');

  fs.writeFileSync(filePath, content);
  console.log('Migrated', file);
}

// Update src/lib/db.ts
const dbTsPath = 'src/lib/db.ts';
const dbContent = `import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/estancia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
});

export const db = pool;
export default db;
`;
fs.writeFileSync(dbTsPath, dbContent);
console.log('Updated db.ts');
