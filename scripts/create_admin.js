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

    const crypto = require('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('novaskill2026', salt, 1000, 64, 'sha512').toString('hex');
    const hashedPassword = `${salt}:${hash}`;
    
    await connection.execute(
      `INSERT INTO users (username, password, role, title) VALUES (?, ?, 'admin', 'Director General')
       ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role), title = VALUES(title)`,
      ['Nova Skill Admin', hashedPassword]
    );

    console.log('✅ Usuario Nova Skill Admin creado correctamente (Director General).');
    await connection.end();
  } catch (error) {
    console.error('❌ Error creando administrador:', error.message);
  }
}

createAdmin();
