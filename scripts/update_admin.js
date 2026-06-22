const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function updateAdmin() {
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

    const allPermissions = JSON.stringify({
      assignChild: true,
      removeChild: true,
      createClassroom: true,
      editClassroom: true,
      deleteClassroom: true,
      registerChild: true,
      planMenu: true,
      viewIncome: true
    });

    await connection.execute(`
      UPDATE users 
      SET 
        username = 'Nova Skill Admin',
        firstName = 'Nova Skill',
        lastName = 'Admin',
        role = 'Admin',
        permissions = ?
      WHERE username = 'Admin' OR username = 'Nova Skill Admin'
    `, [allPermissions]);

    console.log('✅ Usuario actualizado a Nova Skill Admin con todos los privilegios.');
    await connection.end();
  } catch (error) {
    console.error('❌ Error actualizando administrador:', error.message);
  }
}

updateAdmin();
