const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function insertCategories() {
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

    await connection.execute(`
      INSERT IGNORE INTO document_categories (name, description) 
      VALUES 
      ('Estudiantes', 'Documentos relacionados con estudiantes y niños'), 
      ('Personal', 'Documentos de recursos humanos y empleados'), 
      ('General', 'Documentos generales del centro')
    `);

    console.log('✅ Categorías insertadas correctamente.');
    await connection.end();
  } catch (error) {
    console.error('❌ Error insertando categorías:', error.message);
  }
}

insertCategories();
