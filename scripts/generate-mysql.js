const fs = require('fs');

const input = fs.readFileSync('src/lib/initDb.ts', 'utf8');

let schema = input.match(/CREATE TABLE IF NOT EXISTS [\s\S]*?\)/g) || [];

let mysqlSchema = schema.map(sql => {
  let s = sql;
  
  // Convert sqlite types to mysql types
  s = s.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY');
  s = s.replace(/INTEGER PRIMARY KEY/gi, 'INT AUTO_INCREMENT PRIMARY KEY'); // Usually rowid aliases
  s = s.replace(/ DATETIME DEFAULT CURRENT_TIMESTAMP/gi, ' TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  
  // some tables use TEXT for id?
  // `id TEXT PRIMARY KEY` -> `id VARCHAR(255) PRIMARY KEY`
  s = s.replace(/id TEXT PRIMARY KEY/gi, 'id VARCHAR(255) PRIMARY KEY');
  
  // sqlite TEXT to VARCHAR or keep as TEXT. MySQL can use TEXT or VARCHAR
  // For MySQL, TEXT can't have a default value easily. It's better to use VARCHAR(255) for small things, but let's keep TEXT for large, and VARCHAR(255) for short like email, phone.
  // Actually, TEXT in MySQL is fine, but for indexing (like foreign keys or unique), VARCHAR is better.
  
  // Simple TEXT to VARCHAR(255) replacement for common fields
  const varcharFields = ['firstName', 'lastName', 'role', 'status', 'email', 'phone', 'cedula', 'brand', 'model', 'plate', 'code', 'categoryName', 'documentType', 'name', 'password', 'username', 'relationship', 'gender'];
  varcharFields.forEach(field => {
    const reg = new RegExp(`(\\b${field}\\b)\\s+TEXT`, 'g');
    s = s.replace(reg, `$1 VARCHAR(255)`);
  });

  // Re-adjust child_id PRIMARY KEY in medical_records
  s = s.replace(/child_id INT AUTO_INCREMENT PRIMARY KEY/gi, 'child_id INT PRIMARY KEY');
  
  // SQLite BOOLEAN is technically numeric. MySQL uses TINYINT(1) or BOOLEAN
  s = s.replace(/BOOLEAN DEFAULT 0/gi, 'BOOLEAN DEFAULT FALSE');
  s = s.replace(/BOOLEAN DEFAULT 1/gi, 'BOOLEAN DEFAULT TRUE');

  return s + ';';
}).join('\n\n');

// Extra specific fixes
mysqlSchema = mysqlSchema.replace(/FOREIGN KEY \((.*?)\) REFERENCES (.*?)\((.*?)\)/g, 'FOREIGN KEY ($1) REFERENCES $2($3)');

fs.writeFileSync('mysql-schema.sql', mysqlSchema);
console.log('MySQL schema generated.');
