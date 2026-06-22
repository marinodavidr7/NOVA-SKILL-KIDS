const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

async function initDB() {
  try {
    // Parse the DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.replace('/', '');
    
    // Connect without database to create it
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      multipleStatements: true // Crucial for running a full schema file
    });

    console.log(`Conectado a MySQL en ${url.hostname}...`);
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Base de datos '${dbName}' asegurada.`);
    
    // Use the database
    await connection.query(`USE \`${dbName}\``);
    
    // Read and execute schema
    const schemaSql = fs.readFileSync('mysql-schema.sql', 'utf8');
    console.log('Ejecutando mysql-schema.sql (creando tablas)...');
    
    await connection.query(schemaSql);
    console.log('✅ Esquema importado correctamente. ¡Todo listo!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error.message);
  }
}

initDB();
