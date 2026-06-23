const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'estancia'
  });

  try {
    await connection.query('ALTER TABLE subscription_packages ADD COLUMN capacity INT NULL');
    console.log('Successfully added capacity to subscription_packages');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Field already exists.');
    } else {
      console.error(err);
    }
  } finally {
    await connection.end();
  }
}

migrate();
