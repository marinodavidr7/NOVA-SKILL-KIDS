const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

async function migrate() {
  try {
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.replace('/', '');
    
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: dbName,
      multipleStatements: true
    });

    console.log('Conectado a la base de datos...');

    const createTripsSql = `
      CREATE TABLE IF NOT EXISTS transport_trips (
          id INTEGER PRIMARY KEY AUTO_INCREMENT,
          name TEXT NOT NULL,
          destination TEXT NOT NULL,
          date DATE NOT NULL,
          departureTime TIME,
          returnTime TIME,
          eventId INTEGER,
          vehicleId INTEGER,
          totalCapacity INTEGER,
          costPerStudent REAL DEFAULT 0,
          costPerAdult REAL DEFAULT 0,
          status VARCHAR(50) DEFAULT 'Programado',
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE SET NULL,
          FOREIGN KEY (vehicleId) REFERENCES transport_vehicles(id) ON DELETE SET NULL
      );
    `;

    const createParticipantsSql = `
      CREATE TABLE IF NOT EXISTS transport_trip_participants (
          id INTEGER PRIMARY KEY AUTO_INCREMENT,
          tripId INTEGER NOT NULL,
          childId INTEGER NOT NULL,
          accompanyingAdults INTEGER DEFAULT 0,
          authorized BOOLEAN DEFAULT 0,
          totalFee REAL DEFAULT 0,
          amountPaid REAL DEFAULT 0,
          attendanceStatus VARCHAR(50) DEFAULT 'Confirmado',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (tripId) REFERENCES transport_trips(id) ON DELETE CASCADE,
          FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
      );
    `;

    console.log('Creando tablas de viajes...');
    await connection.query(createTripsSql);
    await connection.query(createParticipantsSql);
    
    console.log('Tablas creadas. Agregando al schema...');
    
    const schemaAppend = `
CREATE TABLE transport_trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    date DATE NOT NULL,
    departureTime TIME,
    returnTime TIME,
    eventId INTEGER,
    vehicleId INTEGER,
    totalCapacity INTEGER,
    costPerStudent REAL DEFAULT 0,
    costPerAdult REAL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Programado',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicleId) REFERENCES transport_vehicles(id) ON DELETE SET NULL
);

CREATE TABLE transport_trip_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId INTEGER NOT NULL,
    childId INTEGER NOT NULL,
    accompanyingAdults INTEGER DEFAULT 0,
    authorized BOOLEAN DEFAULT 0,
    totalFee REAL DEFAULT 0,
    amountPaid REAL DEFAULT 0,
    attendanceStatus VARCHAR(50) DEFAULT 'Confirmado',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tripId) REFERENCES transport_trips(id) ON DELETE CASCADE,
    FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
);
`;
    // We only append if it's not already in the schema
    const schemaStr = fs.readFileSync('mysql-schema.sql', 'utf8');
    if (!schemaStr.includes('transport_trips')) {
      fs.appendFileSync('mysql-schema.sql', schemaAppend);
      console.log('Agregado a mysql-schema.sql');
    }

    await connection.end();
    console.log('Migración completada!');
  } catch (error) {
    console.error('Error:', error);
  }
}

migrate();
