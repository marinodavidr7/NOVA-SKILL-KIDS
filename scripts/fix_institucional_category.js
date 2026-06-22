const mysql = require('mysql2/promise');

async function fix() {
  const conn = await mysql.createConnection('mysql://root:root@localhost:3306/estancia');
  
  await conn.execute(
    'INSERT INTO document_categories (name, description) VALUES (?, ?)',
    ['Institucional', 'Documentos institucionales y reglamentarios del centro']
  );
  
  console.log('Categoria Institucional creada exitosamente');
  
  const [rows] = await conn.query('SELECT * FROM document_categories');
  console.log('Categorias actuales:', JSON.stringify(rows));
  
  conn.end();
}

fix().catch(e => console.error('ERROR:', e.message));
