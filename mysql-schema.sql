SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS parents (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      address VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , photoUrl VARCHAR(255), cedula VARCHAR(255));

CREATE TABLE IF NOT EXISTS children (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      dateOfBirth DATE NOT NULL,
      gender VARCHAR(255),
      photoUrl VARCHAR(255),
      status VARCHAR(255) DEFAULT 'active', -- active, suspended, graduated
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , classroomId INTEGER REFERENCES classrooms(id), dismissalReason VARCHAR(255), dismissalDate DATE, dismissalReport VARCHAR(255));

CREATE TABLE IF NOT EXISTS child_parents (
      child_id INTEGER,
      parent_id INTEGER,
      relationship VARCHAR(255) NOT NULL,
      isEmergencyContact BOOLEAN DEFAULT 0,
      isAuthorizedToPickup BOOLEAN DEFAULT 0,
      PRIMARY KEY (child_id, parent_id),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS medical_records (
      child_id INTEGER PRIMARY KEY,
      allergies VARCHAR(255),
      conditions VARCHAR(255),
      authorizedMeds VARCHAR(255),
      vaccines VARCHAR(255),
      notes VARCHAR(255), bloodType VARCHAR(255), emergencyContactName VARCHAR(255), emergencyContactPhone VARCHAR(255), authorizedPickup VARCHAR(255),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      phone VARCHAR(255),
      email VARCHAR(255),
      hireDate DATE,
      status VARCHAR(255) DEFAULT 'active'
    , salary REAL DEFAULT 0, dni VARCHAR(255), birthDate DATE, address VARCHAR(255), emergencyName VARCHAR(255), emergencyPhone VARCHAR(255), emergencyRelation VARCHAR(255), bankName VARCHAR(255), bankAccount VARCHAR(255));

CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      childId INTEGER NOT NULL,
      date DATE NOT NULL,
      checkIn TIME,
      checkOut TIME,
      status VARCHAR(255) DEFAULT 'present',
      notes VARCHAR(255),
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS classrooms (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 20,
      minAge INTEGER DEFAULT 0,
      maxAge INTEGER DEFAULT 6,
      description VARCHAR(255),
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
      title VARCHAR(255) NOT NULL,
      description VARCHAR(255),
      date DATE NOT NULL,
      objectives VARCHAR(255),
      materials VARCHAR(255),
      status VARCHAR(255) DEFAULT 'planned',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (classroomId) REFERENCES classrooms(id)
    );

CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      childId INTEGER NOT NULL,
      area VARCHAR(255) NOT NULL,
      score VARCHAR(255),
      observations VARCHAR(255),
      date DATE NOT NULL,
      evaluator VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      date DATE NOT NULL,
      mealType VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      calories INTEGER,
      allergens VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS dietary_restrictions (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      childId INTEGER NOT NULL,
      restriction VARCHAR(255) NOT NULL,
      severity VARCHAR(255) DEFAULT 'moderate',
      notes VARCHAR(255),
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      type VARCHAR(255) NOT NULL,
      amount REAL NOT NULL,
      description VARCHAR(255),
      childId INTEGER,
      date DATE NOT NULL,
      paymentMethod VARCHAR(255) DEFAULT 'cash',
      reference VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, period VARCHAR(255), accountId INTEGER REFERENCES finance_accounts(id), status VARCHAR(255) DEFAULT 'paid', dueDate DATE, invoiceNumber VARCHAR(255),
      FOREIGN KEY (childId) REFERENCES children(id)
    );

CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      category VARCHAR(255) NOT NULL,
      subcategory VARCHAR(255),
      amount REAL NOT NULL,
      description VARCHAR(255),
      date DATE NOT NULL,
      vendor VARCHAR(255),
      reference VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , accountId INTEGER REFERENCES finance_accounts(id), status VARCHAR(255) DEFAULT 'paid', receiptUrl VARCHAR(255), dueDate DATE);

CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit VARCHAR(255) DEFAULT 'unidad',
      minStock INTEGER DEFAULT 5,
      location VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , lastPurchaseCost REAL DEFAULT 0, status VARCHAR(255) DEFAULT 'active', receiptUrl VARCHAR(255));

CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      inventoryId INTEGER NOT NULL,
      type VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      notes VARCHAR(255),
      date DATETIME DEFAULT CURRENT_TIMESTAMP, cost REAL DEFAULT 0, accountId INTEGER REFERENCES finance_accounts(id), receiptUrl VARCHAR(255),
      FOREIGN KEY (inventoryId) REFERENCES inventory(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      purchaseDate DATE,
      purchaseValue REAL DEFAULT 0,
      status VARCHAR(255) DEFAULT 'active',
      location VARCHAR(255),
      serialNumber VARCHAR(255),
      notes VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS asset_maintenance (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      assetId INTEGER NOT NULL,
      date DATE NOT NULL,
      description VARCHAR(255) NOT NULL,
      cost REAL DEFAULT 0,
      technician VARCHAR(255),
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
      notes VARCHAR(255),
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS staff_leaves (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      staffId INTEGER NOT NULL,
      type VARCHAR(255) NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status VARCHAR(255) DEFAULT 'pending',
      reason VARCHAR(255),
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

CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTO_INCREMENT, title VARCHAR(255) NOT NULL, description VARCHAR(255), date DATE NOT NULL, time TIME, type VARCHAR(255) DEFAULT 'general', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS menu_alternatives (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      menu_id INTEGER,
      child_id INTEGER,
      description VARCHAR(255) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS read_notifications (id VARCHAR(255) PRIMARY KEY, readAt DATETIME DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS `users` (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      staffId INTEGER,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      pin VARCHAR(255),
      role VARCHAR(255) DEFAULT 'teacher',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, permissions VARCHAR(255) DEFAULT '{}', firstName VARCHAR(255), lastName VARCHAR(255), email VARCHAR(255), avatar VARCHAR(255), title VARCHAR(255),
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS finance_accounts (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL, -- 'bank', 'cash'
      currency VARCHAR(255) DEFAULT 'DOP',
      balance REAL DEFAULT 0,
      accountNumber VARCHAR(255),
      bankName VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS finance_transactions (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      accountId INTEGER NOT NULL,
      type VARCHAR(255) NOT NULL, -- 'in', 'out', 'transfer'
      amount REAL NOT NULL,
      date DATE NOT NULL,
      reference VARCHAR(255),
      description VARCHAR(255),
      category VARCHAR(255),
      relatedId INTEGER, -- ID de income o expense si aplica
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, receiptUrl VARCHAR(255),
      FOREIGN KEY (accountId) REFERENCES finance_accounts(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      lender VARCHAR(255) NOT NULL,
      amount REAL NOT NULL,
      interestRate REAL DEFAULT 0,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status VARCHAR(255) DEFAULT 'active', -- 'active', 'paid'
      notes VARCHAR(255),
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
      reference VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loanId) REFERENCES loans(id) ON DELETE CASCADE,
      FOREIGN KEY (accountId) REFERENCES finance_accounts(id)
    );

CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      category VARCHAR(255) NOT NULL,
      period VARCHAR(255) NOT NULL, -- YYYY-MM
      estimatedAmount REAL NOT NULL,
      notes VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, period)
    );

CREATE TABLE IF NOT EXISTS petty_cash (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      custodian VARCHAR(255) NOT NULL,
      balance REAL DEFAULT 0,
      cashLimit REAL DEFAULT 5000,
      status VARCHAR(255) DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS petty_cash_transactions (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      pettyCashId INTEGER NOT NULL,
      type VARCHAR(255) NOT NULL, -- 'replenish', 'expense'
      amount REAL NOT NULL,
      description VARCHAR(255) NOT NULL,
      receiptUrl VARCHAR(255),
      date DATE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pettyCashId) REFERENCES petty_cash(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS health_incidents (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  childId INTEGER NOT NULL,
  date VARCHAR(255) NOT NULL,
  time VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  resolvedDate VARCHAR(255),
  resolutionNotes VARCHAR(255),
  createdAt VARCHAR(255) NOT NULL,
  FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
      `key` VARCHAR(255) PRIMARY KEY,
      value VARCHAR(255) NOT NULL
    );

CREATE TABLE IF NOT EXISTS transport_vehicles (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      code VARCHAR(255) UNIQUE NOT NULL,
      brand VARCHAR(255) NOT NULL,
      model VARCHAR(255) NOT NULL,
      year INTEGER,
      plate VARCHAR(255) UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      status VARCHAR(255) DEFAULT 'Activo', -- Activo, Mantenimiento, Inactivo
      insuranceExpiration DATE,
      registrationExpiration DATE,
      notes VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS transport_drivers (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      licenseNumber VARCHAR(255) UNIQUE NOT NULL,
      licenseExpiration DATE,
      phone VARCHAR(255),
      address VARCHAR(255),
      status VARCHAR(255) DEFAULT 'Activo', -- Activo, Inactivo
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS transport_monitors (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      phone VARCHAR(255),
      assignedRouteId INTEGER,
      status VARCHAR(255) DEFAULT 'Activo',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS transport_routes (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      sectors VARCHAR(255),
      departureTime VARCHAR(255),
      returnTime VARCHAR(255),
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
      name VARCHAR(255) NOT NULL,
      time VARCHAR(255),
      orderIndex INTEGER,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS transport_assignments (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      childId INTEGER NOT NULL,
      routeId INTEGER NOT NULL,
      pickupAddress VARCHAR(255),
      dropoffAddress VARCHAR(255),
      specialSchedule VARCHAR(255),
      authorizedPerson VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS transport_attendance (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      assignmentId INTEGER NOT NULL,
      date DATE NOT NULL,
      pickupStatus VARCHAR(255), -- Abordado, Ausente
      dropoffStatus VARCHAR(255), -- Entregado, Ausente
      notes VARCHAR(255),
      recordedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignmentId) REFERENCES transport_assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (recordedBy) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS transport_incidents (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      routeId INTEGER NOT NULL,
      date DATE NOT NULL,
      description VARCHAR(255) NOT NULL,
      reportedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE,
      FOREIGN KEY (reportedBy) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS transport_expenses (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      vehicleId INTEGER NOT NULL,
      date DATE NOT NULL,
      type VARCHAR(255) NOT NULL, -- Combustible, Mantenimiento, Reparacion, Seguro, Otro
      amount REAL NOT NULL,
      description VARCHAR(255),
      recordedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicleId) REFERENCES transport_vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY (recordedBy) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS document_categories (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) UNIQUE NOT NULL,
      description VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(255),
      categoryId INTEGER NOT NULL,
      entityType VARCHAR(255), -- student, staff, institution, etc.
      entityId INTEGER, -- childId, staffId, etc.
      documentType VARCHAR(255), -- Acta de nacimiento, Cedula, Contrato, etc.
      fileUrl VARCHAR(255) NOT NULL,
      fileType VARCHAR(255),
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
      fileUrl VARCHAR(255) NOT NULL,
      fileType VARCHAR(255),
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
      action VARCHAR(255) NOT NULL, -- viewed, downloaded, modified, approved
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
      notes VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      approvedAt DATETIME,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (requestedBy) REFERENCES users(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    );

CREATE TABLE IF NOT EXISTS parent_reports (id INTEGER PRIMARY KEY AUTO_INCREMENT, parentId INTEGER NOT NULL, eventId INTEGER, type VARCHAR(255) NOT NULL, date DATE, title VARCHAR(255), description VARCHAR(255), attended INTEGER, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parentId) REFERENCES parents(id), FOREIGN KEY (eventId) REFERENCES events(id));

SET FOREIGN_KEY_CHECKS=1;