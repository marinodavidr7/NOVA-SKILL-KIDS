const fs = require('fs');
let c = fs.readFileSync('schema_dump.sql', 'utf8');
c = c.replace(/CREATE TABLE/g, 'CREATE TABLE IF NOT EXISTS');
c = c.replace(/AUTOINCREMENT/g, 'AUTO_INCREMENT');
c = c.replace(/"/g, '`');
c = c.replace(/\bTEXT\b/g, 'VARCHAR(255)');
c = c.replace(/\bkey VARCHAR\(255\) PRIMARY KEY/g, '`key` VARCHAR(255) PRIMARY KEY');
c = 'SET FOREIGN_KEY_CHECKS=0;\n\n' + c + '\n\nSET FOREIGN_KEY_CHECKS=1;';
fs.writeFileSync('mysql-schema.sql', c);
