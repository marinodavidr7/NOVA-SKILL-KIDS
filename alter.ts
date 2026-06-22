import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    uri: 'mysql://root:root@127.0.0.1:3306/estancia',
  });
  
  try {
    await connection.query('ALTER TABLE menus ADD COLUMN beverage TEXT DEFAULT NULL');
    console.log('Column beverage added successfully');
  } catch (e: any) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column beverage already exists');
    } else {
      console.error(e);
    }
  }
  await connection.end();
}

run();
