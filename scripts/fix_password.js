const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function fixPassword() {
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

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('novaskill2026', 10);
    
    await connection.execute(
      `UPDATE users SET password = ? WHERE username = 'Nova Skill Admin'`,
      [hashedPassword]
    );

    console.log('✅ Contraseña restablecida correctamente.');
    await connection.end();
  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error.message);
  }
}

fixPassword();
