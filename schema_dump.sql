CREATE TABLE parents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , photoUrl TEXT, cedula TEXT);

CREATE TABLE children (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      dateOfBirth DATE NOT NULL,
      gender TEXT,
      photoUrl TEXT,
      status TEXT DEFAULT 'active', -- active, suspended, graduated
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , classroomId INTEGER REFERENCES classrooms(id), dismissalReason TEXT, dismissalDate DATE, dismissalReport TEXT);

CREATE TABLE child_parents (
      child_id INTEGER,
      parent_id INTEGER,
      relationship TEXT NOT NULL,
      isEmergencyContact BOOLEAN DEFAULT 0,
      isAuthorizedToPickup BOOLEAN DEFAULT 0,
      PRIMARY KEY (child_id, parent_id),
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
    );

CREATE TABLE medical_records (
      child_id INTEGER PRIMARY KEY,
      allergies TEXT,
      conditions TEXT,
      authorizedMeds TEXT,
      vaccines TEXT,
      notes TEXT, bloodType TEXT, emergencyContactName TEXT, emergencyContactPhone TEXT, authorizedPickup TEXT,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      hireDate DATE,
      status TEXT DEFAULT 'active'
    , salary REAL DEFAULT 0, dni TEXT, birthDate DATE, address TEXT, emergencyName TEXT, emergencyPhone TEXT, emergencyRelation TEXT, bankName TEXT, bankAccount TEXT);

CREATE TABLE attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      childId INTEGER NOT NULL,
      date DATE NOT NULL,
      checkIn TIME,
      checkOut TIME,
      status TEXT DEFAULT 'present',
      notes TEXT,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE classrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 20,
      minAge INTEGER DEFAULT 0,
      maxAge INTEGER DEFAULT 6,
      description TEXT,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE classroom_staff (
      classroomId INTEGER,
      staffId INTEGER,
      PRIMARY KEY (classroomId, staffId),
      FOREIGN KEY (classroomId) REFERENCES classrooms(id) ON DELETE CASCADE,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );

CREATE TABLE lesson_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classroomId INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      objectives TEXT,
      materials TEXT,
      status TEXT DEFAULT 'planned',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (classroomId) REFERENCES classrooms(id)
    );

CREATE TABLE evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      childId INTEGER NOT NULL,
      area TEXT NOT NULL,
      score TEXT,
      observations TEXT,
      date DATE NOT NULL,
      evaluator TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      mealType TEXT NOT NULL,
      description TEXT NOT NULL,
      calories INTEGER,
      allergens TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE dietary_restrictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      childId INTEGER NOT NULL,
      restriction TEXT NOT NULL,
      severity TEXT DEFAULT 'moderate',
      notes TEXT,
      FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      childId INTEGER,
      date DATE NOT NULL,
      paymentMethod TEXT DEFAULT 'cash',
      reference TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, period TEXT, accountId INTEGER REFERENCES finance_accounts(id), status TEXT DEFAULT 'paid', dueDate DATE, invoiceNumber TEXT,
      FOREIGN KEY (childId) REFERENCES children(id)
    );

CREATE TABLE expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      subcategory TEXT,
      amount REAL NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      vendor TEXT,
      reference TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , accountId INTEGER REFERENCES finance_accounts(id), status TEXT DEFAULT 'paid', receiptUrl TEXT, dueDate DATE);

CREATE TABLE inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'unidad',
      minStock INTEGER DEFAULT 5,
      location TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    , lastPurchaseCost REAL DEFAULT 0, status TEXT DEFAULT 'active', receiptUrl TEXT);

CREATE TABLE inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventoryId INTEGER NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP, cost REAL DEFAULT 0, accountId INTEGER REFERENCES finance_accounts(id), receiptUrl TEXT,
      FOREIGN KEY (inventoryId) REFERENCES inventory(id) ON DELETE CASCADE
    );

CREATE TABLE assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      purchaseDate DATE,
      purchaseValue REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      location TEXT,
      serialNumber TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE asset_maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assetId INTEGER NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      cost REAL DEFAULT 0,
      technician TEXT,
      nextMaintenanceDate DATE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
    );

CREATE TABLE staff_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER NOT NULL,
      date DATE NOT NULL,
      checkIn TIME,
      checkOut TIME,
      status TEXT DEFAULT 'present',
      notes TEXT,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );

CREATE TABLE staff_leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER NOT NULL,
      type TEXT NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      reason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );

CREATE TABLE staff_payroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER NOT NULL,
      periodStart DATE NOT NULL,
      periodEnd DATE NOT NULL,
      baseSalary REAL NOT NULL,
      bonuses REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      netPay REAL NOT NULL,
      paymentDate DATE,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );

CREATE TABLE events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, date DATE NOT NULL, time TIME, type TEXT DEFAULT 'general', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE menu_alternatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_id INTEGER,
      child_id INTEGER,
      description TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
    );

CREATE TABLE read_notifications (id TEXT PRIMARY KEY, readAt DATETIME DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE "users" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staffId INTEGER,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      pin TEXT,
      role TEXT DEFAULT 'teacher',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, permissions TEXT DEFAULT '{}', firstName TEXT, lastName TEXT, email TEXT, avatar TEXT, title TEXT,
      FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE CASCADE
    );

CREATE TABLE finance_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'bank', 'cash'
      currency TEXT DEFAULT 'DOP',
      balance REAL DEFAULT 0,
      accountNumber TEXT,
      bankName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE finance_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lender TEXT NOT NULL,
      amount REAL NOT NULL,
      interestRate REAL DEFAULT 0,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      status TEXT DEFAULT 'active', -- 'active', 'paid'
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE loan_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      period TEXT NOT NULL, -- YYYY-MM
      estimatedAmount REAL NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, period)
    );

CREATE TABLE petty_cash (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      custodian TEXT NOT NULL,
      balance REAL DEFAULT 0,
      cashLimit REAL DEFAULT 5000,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE petty_cash_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pettyCashId INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'replenish', 'expense'
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      receiptUrl TEXT,
      date DATE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pettyCashId) REFERENCES petty_cash(id) ON DELETE CASCADE
    );

CREATE TABLE health_incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  childId INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  resolvedDate TEXT,
  resolutionNotes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
);

CREATE TABLE app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

CREATE TABLE transport_vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      plate TEXT UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT DEFAULT 'Activo', -- Activo, Mantenimiento, Inactivo
      insuranceExpiration DATE,
      registrationExpiration DATE,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE transport_drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      licenseNumber TEXT UNIQUE NOT NULL,
      licenseExpiration DATE,
      phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'Activo', -- Activo, Inactivo
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE transport_monitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT,
      assignedRouteId INTEGER,
      status TEXT DEFAULT 'Activo',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE transport_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sectors TEXT,
      departureTime TEXT,
      returnTime TEXT,
      vehicleId INTEGER,
      driverId INTEGER,
      status TEXT DEFAULT 'Activo',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicleId) REFERENCES transport_vehicles(id),
      FOREIGN KEY (driverId) REFERENCES transport_drivers(id)
    );

CREATE TABLE transport_route_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routeId INTEGER NOT NULL,
      name TEXT NOT NULL,
      time TEXT,
      orderIndex INTEGER,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE
    );

CREATE TABLE transport_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE transport_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE transport_incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routeId INTEGER NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      reportedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (routeId) REFERENCES transport_routes(id) ON DELETE CASCADE,
      FOREIGN KEY (reportedBy) REFERENCES users(id)
    );

CREATE TABLE transport_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE document_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );

CREATE TABLE documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      status TEXT DEFAULT 'Activo',
      uploadedBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES document_categories(id),
      FOREIGN KEY (uploadedBy) REFERENCES users(id)
    );

CREATE TABLE document_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE document_access_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      action TEXT NOT NULL, -- viewed, downloaded, modified, approved
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

CREATE TABLE document_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId INTEGER NOT NULL,
      requestedBy INTEGER NOT NULL,
      approvedBy INTEGER,
      status TEXT DEFAULT 'Pendiente', -- Pendiente, Aprobado, Rechazado
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      approvedAt DATETIME,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (requestedBy) REFERENCES users(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    );

CREATE TABLE parent_reports (id INTEGER PRIMARY KEY AUTOINCREMENT, parentId INTEGER NOT NULL, eventId INTEGER, type TEXT NOT NULL, date DATE, title TEXT, description TEXT, attended INTEGER, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parentId) REFERENCES parents(id), FOREIGN KEY (eventId) REFERENCES events(id));