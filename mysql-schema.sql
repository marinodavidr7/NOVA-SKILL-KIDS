CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , photoUrl TEXT, cedula TEXT);
CREATE TABLE IF NOT EXISTS children (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      dateOfBirth DATE NOT NULL,
      gender TEXT,
      photoUrl TEXT,
      status VARCHAR(255) DEFAULT 'active', -- active, suspended, graduated
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , classroomId INTEGER REFERENCES classrooms(id), dismissalReason TEXT, dismissalDate DATE, dismissalReport TEXT);
CREATE TABLE IF NOT EXISTS child_parents (
      child_id INTEGER,
      parent_id INTEGER,
      relationship TEXT NOT NULL,
      isEmergencyContact BOOLEAN DEFAULT 0,
      isAuthorizedToPickup BOOLEAN DEFAULT 0,
      PRIMARY KEY (child_id, parent_id),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS medical_records (
      child_id INTEGER PRIMARY KEY,
      allergies TEXT,
      conditions TEXT,
      authorizedMeds TEXT,
      vaccines TEXT,
      notes TEXT, bloodType TEXT, emergencyContactName TEXT, emergencyContactPhone TEXT, authorizedPickup TEXT,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      hireDate DATE,
      status VARCHAR(255) DEFAULT 'active'
    , salary REAL DEFAULT 0, dni TEXT, birthDate DATE, address TEXT, emergencyName TEXT, emergencyPhone TEXT, emergencyRelation TEXT, bankName TEXT, bankAccount TEXT);
CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      childId INTEGER NOT NULL,
      date DATE NOT NULL,
      checkIn TIME,
      checkOut TIME,
      status VARCHAR(255) DEFAULT 'present',
      notes TEXT,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS classrooms (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 20,
      minAge INTEGER DEFAULT 0,
      maxAge INTEGER DEFAULT 6,
      description TEXT,
      status VARCHAR(255) DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS classroom_staff (
      classroomId INTEGER,
      staffId INTEGER,
      PRIMARY KEY (classroomId, staffId),
      FOREIGN KEY (classroomId) REFERENCES classrooms(id) ON DELETE CASCADE,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS lesson_plans (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      classroomId INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      objectives TEXT,
      materials TEXT,
      status VARCHAR(255) DEFAULT 'planned',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (classroomId) REFERENCES classrooms(id)
    );
CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      childId INTEGER NOT NULL,
      area TEXT NOT NULL,
      score TEXT,
      observations TEXT,
      date DATE NOT NULL,
      evaluator TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      date DATE NOT NULL,
      mealType TEXT NOT NULL,
      description TEXT NOT NULL,
      calories INTEGER,
      allergens TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS dietary_restrictions (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      childId INTEGER NOT NULL,
      restriction TEXT NOT NULL,
      severity VARCHAR(255) DEFAULT 'moderate',
      notes TEXT,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      childId INTEGER,
      date DATE NOT NULL,
      paymentMethod VARCHAR(255) DEFAULT 'cash',
      reference TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, period TEXT, accountId INTEGER REFERENCES finance_accounts(id), status VARCHAR(255) DEFAULT 'paid', dueDate DATE, invoiceNumber TEXT,
      FOREIGN KEY (childId) REFERENCES children(id)
    );
CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      category TEXT NOT NULL,
      subcategory TEXT,
      amount REAL NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      vendor TEXT,
      reference TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , accountId INTEGER REFERENCES finance_accounts(id), status VARCHAR(255) DEFAULT 'paid', receiptUrl TEXT, dueDate DATE);
CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit VARCHAR(255) DEFAULT 'unidad',
      minStock INTEGER DEFAULT 5,
      location TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , lastPurchaseCost REAL DEFAULT 0, status VARCHAR(255) DEFAULT 'active', receiptUrl TEXT);
CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      inventoryId INTEGER NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP, cost REAL DEFAULT 0, accountId INTEGER REFERENCES finance_accounts(id), receiptUrl TEXT,
      FOREIGN KEY (inventoryId) REFERENCES inventory(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      purchaseDate DATE,
      purchaseValue REAL DEFAULT 0,
      status VARCHAR(255) DEFAULT 'active',
      location TEXT,
      serialNumber TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS asset_maintenance (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      assetId INTEGER NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      cost REAL DEFAULT 0,
      technician TEXT,
      nextMaintenanceDate DATE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS staff_attendance (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      staffId INTEGER NOT NULL,
      date DATE NOT NULL,
      checkIn TIME,
      checkOut TIME,
      status VARCHAR(255) DEFAULT 'present',
      notes TEXT,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS staff_leaves (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      staffId INTEGER NOT NULL,
      type TEXT NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status VARCHAR(255) DEFAULT 'pending',
      reason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS staff_payroll (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      staffId INTEGER NOT NULL,
      periodStart DATE NOT NULL,
      periodEnd DATE NOT NULL,
      baseSalary REAL NOT NULL,
      bonuses REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      netPay REAL NOT NULL,
      paymentDate DATE,
      status VARCHAR(255) DEFAULT 'pending',
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTO_INCREMENT, title TEXT NOT NULL, description TEXT, date DATE NOT NULL, time TIME, type VARCHAR(255) DEFAULT 'general', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS menu_alternatives (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      menu_id INTEGER,
      child_id INTEGER,
      description TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS read_notifications (id VARCHAR(255) PRIMARY KEY, readAt DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      staffId INTEGER,
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      pin TEXT,
      role VARCHAR(255) DEFAULT 'teacher',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, permissions VARCHAR(255) DEFAULT '{}', firstName TEXT, lastName TEXT, email TEXT, avatar TEXT, title TEXT,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS finance_accounts (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'bank', 'cash'
      currency VARCHAR(255) DEFAULT 'DOP',
      balance REAL DEFAULT 0,
      accountNumber TEXT,
      bankName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS finance_transactions (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      accountId INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'in', 'out', 'transfer'
      amount REAL NOT NULL,
      date DATE NOT NULL,
      reference TEXT,
      description TEXT,
      category TEXT,
      relatedId INTEGER, -- ID de income o expense si aplica
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, receiptUrl TEXT,
      FOREIGN KEY (accountId) REFERENCES finance_accounts(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      lender TEXT NOT NULL,
      amount REAL NOT NULL,
      interestRate REAL DEFAULT 0,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status VARCHAR(255) DEFAULT 'active', -- 'active', 'paid'
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS loan_payments (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      loanId INTEGER NOT NULL,
      accountId INTEGER,
      amount REAL NOT NULL,
      principal REAL DEFAULT 0,
      interest REAL DEFAULT 0,
      date DATE NOT NULL,
      reference TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loanId) REFERENCES loans(id) ON DELETE CASCADE,
      FOREIGN KEY (accountId) REFERENCES finance_accounts(id)
    );
CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      category TEXT NOT NULL,
      period TEXT NOT NULL, -- YYYY-MM
      estimatedAmount REAL NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, period)
    );
CREATE TABLE IF NOT EXISTS petty_cash (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name TEXT NOT NULL,
      custodian TEXT NOT NULL,
      balance REAL DEFAULT 0,
      cashLimit REAL DEFAULT 5000,
      status VARCHAR(255) DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS petty_cash_transactions (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      pettyCashId INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'replenish', 'expense'
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      receiptUrl TEXT,
      date DATE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pettyCashId) REFERENCES petty_cash(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS health_incidents (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  childId INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  resolvedDate TEXT,
  resolutionNotes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS app_settings (
      key_name VARCHAR(255) PRIMARY KEY,
      value TEXT NOT NULL
    );
CREATE TABLE IF NOT EXISTS transport_vehicles (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      code VARCHAR(255) UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      plate VARCHAR(255) UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      status VARCHAR(255) DEFAULT 'Activo', -- Activo, Mantenimiento, Inactivo
      insuranceExpiration DATE,
      registrationExpiration DATE,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS transport_drivers (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      licenseNumber VARCHAR(255) UNIQUE NOT NULL,
      licenseExpiration DATE,
      phone TEXT,
      address TEXT,
      status VARCHAR(255) DEFAULT 'Activo', -- Activo, Inactivo
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS transport_monitors (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT,
      assignedRouteId INTEGER,
      status VARCHAR(255) DEFAULT 'Activo',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS transport_routes (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name TEXT NOT NULL,
      sectors TEXT,
      departureTime TEXT,
      returnTime TEXT,
      vehicleId INTEGER,
      driverId INTEGER,
      status VARCHAR(255) DEFAULT 'Activo',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicleId) REFERENCES transport_vehicles(id),
      FOREIGN KEY (driverId) REFERENCES transport_drivers(id)
    );
CREATE TABLE IF NOT EXISTS transport_route_stops (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      routeId INTEGER NOT NULL,
      name TEXT NOT NULL,
      time TEXT,
      orderIndex INTEGER,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS transport_assignments (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      childId INTEGER NOT NULL,
      routeId INTEGER NOT NULL,
      pickupAddress TEXT,
      dropoffAddress TEXT,
      specialSchedule TEXT,
      authorizedPerson TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE
    );
CREATE TABLE IF NOT EXISTS transport_attendance (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      assignmentId INTEGER NOT NULL,
      date DATE NOT NULL,
      pickupStatus TEXT, -- Abordado, Ausente
      dropoffStatus TEXT, -- Entregado, Ausente
      notes TEXT,
      recordedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignmentId) REFERENCES transport_assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (recordedBy) REFERENCES users(id)
    );
CREATE TABLE IF NOT EXISTS transport_incidents (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      routeId INTEGER NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      reportedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE,
      FOREIGN KEY (reportedBy) REFERENCES users(id)
    );
CREATE TABLE IF NOT EXISTS transport_expenses (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      vehicleId INTEGER NOT NULL,
      date DATE NOT NULL,
      type TEXT NOT NULL, -- Combustible, Mantenimiento, Reparacion, Seguro, Otro
      amount REAL NOT NULL,
      description TEXT,
      recordedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicleId) REFERENCES transport_vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY (recordedBy) REFERENCES users(id)
    );
CREATE TABLE IF NOT EXISTS document_categories (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT
    );
CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      categoryId INTEGER NOT NULL,
      entityType TEXT, -- student, staff, institution, etc.
      entityId INTEGER, -- childId, staffId, etc.
      documentType TEXT, -- Acta de nacimiento, Cedula, Contrato, etc.
      fileUrl TEXT NOT NULL,
      fileType TEXT,
      fileSize INTEGER,
      expirationDate DATE,
      status VARCHAR(255) DEFAULT 'Activo',
      uploadedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES document_categories(id),
      FOREIGN KEY (uploadedBy) REFERENCES users(id)
    );
CREATE TABLE IF NOT EXISTS document_versions (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      documentId INTEGER NOT NULL,
      fileUrl TEXT NOT NULL,
      fileType TEXT,
      fileSize INTEGER,
      versionNumber INTEGER NOT NULL,
      uploadedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (uploadedBy) REFERENCES users(id)
    );
CREATE TABLE IF NOT EXISTS document_access_log (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      documentId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      action TEXT NOT NULL, -- viewed, downloaded, modified, approved
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
CREATE TABLE IF NOT EXISTS document_approvals (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      documentId INTEGER NOT NULL,
      requestedBy INTEGER NOT NULL,
      approvedBy INTEGER,
      status VARCHAR(255) DEFAULT 'Pendiente', -- Pendiente, Aprobado, Rechazado
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      approvedAt DATETIME,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (requestedBy) REFERENCES users(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    );
CREATE TABLE IF NOT EXISTS parent_reports (id INTEGER PRIMARY KEY AUTO_INCREMENT, parentId INTEGER NOT NULL, eventId INTEGER, type TEXT NOT NULL, date DATE, title TEXT, description TEXT, attended INTEGER, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parentId) REFERENCES parents(id), FOREIGN KEY (eventId) REFERENCES events(id));
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