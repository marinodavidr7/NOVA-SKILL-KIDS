const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is installed as it was in previous versions
require('dotenv').config({ path: '.env' });

async function createAdmin() {
  try {
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.replace('/', '');
    
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: dbName
    });

    const hashedPassword = await bcrypt.hash('novaskill2026', 10);
    
    await connection.execute(
      `INSERT INTO users (username, password, role) VALUES (?, ?, 'Admin')`,
      ['Admin', hashedPassword]
    );

    console.log('✅ Usuario Admin creado correctamente.');
    await connection.end();
  } catch (error) {
    console.error('❌ Error creando administrador:', error.message);
  }
}

createAdmin();
