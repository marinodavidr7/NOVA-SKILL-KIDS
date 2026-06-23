const mysql = require('mysql2/promise');

async function createSchema() {
  const connection = await mysql.createConnection('mysql://root:root@127.0.0.1:3306/estancia');

  try {
    console.log('Connected to database.');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscription_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        min_age INT,
        max_age INT,
        duration_weeks INT,
        start_date DATE,
        end_date DATE,
        schedule_days VARCHAR(255),
        start_time TIME,
        end_time TIME,
        enrollment_fee DECIMAL(10, 2),
        periodic_fee DECIMAL(10, 2),
        periodic_frequency VARCHAR(50),
        total_fee DECIMAL(10, 2),
        payment_deadline INT,
        discount_percentage DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created subscription_packages table.');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS child_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        child_id INT NOT NULL,
        package_id INT NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        discount_applied DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (package_id) REFERENCES subscription_packages(id) ON DELETE CASCADE
      )
    `);
    console.log('Created child_subscriptions table.');

    console.log('Schema created successfully.');
  } catch (err) {
    console.error('Error creating schema:', err);
  } finally {
    await connection.end();
  }
}

createSchema();
