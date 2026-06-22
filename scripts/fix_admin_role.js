const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function fixAdminRole() {
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

    await connection.execute(
      `UPDATE users SET role = 'admin', title = 'Director General' WHERE username = 'Nova Skill Admin'`
    );

    console.log('✅ Rol actualizado a admin (minúscula) y title asignado a Director General');
    await connection.end();
  } catch (error) {
    console.error('❌ Error actualizando administrador:', error.message);
  }
}

fixAdminRole();
