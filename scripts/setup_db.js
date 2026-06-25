const mysql = require('mysql2/promise');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

async function initDB() {
  try {
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.replace('/', '');
    
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      multipleStatements: true
    });

    console.log(`Conectado a MySQL en ${url.hostname}...`);
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Base de datos '${dbName}' asegurada.`);
    
    await connection.query(`USE \`${dbName}\``);
    
    const schemaSql = fs.readFileSync('mysql-schema.sql', 'utf8');
    console.log('Ejecutando mysql-schema.sql (creando tablas)...');
    
    await connection.query(schemaSql);
    console.log('✅ Esquema importado correctamente.');
    
    // Check if users table is empty to avoid duplicating admin
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      console.log('Creando usuario administrador por defecto...');
      const hashedPassword = await bcrypt.hash('novaskill2026', 10);
      await connection.execute(
        `INSERT INTO users (username, password, role, title) VALUES (?, ?, 'admin', 'Director General')
         ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role), title = VALUES(title)`,
        ['Nova Skill Admin', hashedPassword]
      );
      console.log('✅ Usuario administrador (Nova Skill Admin / novaskill2026) creado por defecto (Director General).');
    } else {
      console.log('ℹ️ La tabla de usuarios ya contiene datos, saltando la creación del admin.');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error.message);
  }
}

initDB();
