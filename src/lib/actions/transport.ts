'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';

// ==========================================
// VEHÍCULOS
// ==========================================

export async function getVehicles() {
  const [rows] = await db.query(`SELECT * FROM transport_vehicles ORDER BY createdAt DESC`);
  return rows as any[];
}

export async function createVehicle(data: any) {
  try {
    const [result] = await db.execute<any>(`
      INSERT INTO transport_vehicles (code, brand, model, year, plate, capacity, status, insuranceExpiration, registrationExpiration, notes)
      VALUES (:code, :brand, :model, :year, :plate, :capacity, :status, :insuranceExpiration, :registrationExpiration, :notes)
    `, data);
    revalidatePath('/transport');
    revalidatePath('/transport/vehicles');
    return { success: true, id: result.insertId };
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return { success: false, error: error.message };
  }
}

export async function updateVehicle(id: number, data: any) {
  try {
    await db.execute(`
      UPDATE transport_vehicles
      SET code = :code, brand = :brand, model = :model, year = :year, plate = :plate, capacity = :capacity, 
          status = :status, insuranceExpiration = :insuranceExpiration, registrationExpiration = :registrationExpiration, notes = :notes
      WHERE id = :id
    `, { ...data, id });
    revalidatePath('/transport');
    revalidatePath('/transport/vehicles');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteVehicle(id: number) {
  try {
    await db.execute(`DELETE FROM transport_vehicles WHERE id = ?`, [id]);
    revalidatePath('/transport');
    revalidatePath('/transport/vehicles');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// CONDUCTORES
// ==========================================

export async function getDrivers() {
  const [rows] = await db.query(`SELECT * FROM transport_drivers ORDER BY firstName, lastName`);
  return rows as any[];
}

export async function createDriver(data: any) {
  try {
    const stmt_sql = `
      INSERT INTO transport_drivers (firstName, lastName, licenseNumber, licenseExpiration, phone, address, status)
      VALUES (:firstName, :lastName, :licenseNumber, :licenseExpiration, :phone, :address, :status)
    `;
    const [result] = await db.execute<any>(stmt_sql, data);
    revalidatePath('/transport');
    revalidatePath('/transport/drivers');
    return { success: true, id: result.insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDriver(id: number, data: any) {
  try {
    const stmt_sql = `
      UPDATE transport_drivers
      SET firstName = :firstName, lastName = :lastName, licenseNumber = :licenseNumber, 
          licenseExpiration = :licenseExpiration, phone = :phone, address = :address, status = :status
      WHERE id = :id
    `;
    await db.execute(stmt_sql, { ...data, id });
    revalidatePath('/transport');
    revalidatePath('/transport/drivers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDriver(id: number) {
  try {
    await db.execute(`DELETE FROM transport_drivers WHERE id = ?`, [id]);
    revalidatePath('/transport/drivers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// MONITORES (ASISTENTES)
// ==========================================

export async function getMonitors() {
  const [rows] = await db.query(`
    SELECT m.*, r.name as routeName 
    FROM transport_monitors m 
    LEFT JOIN transport_routes r ON m.assignedRouteId = r.id
    ORDER BY m.firstName, m.lastName
  `);
  return rows as any[];
}

export async function createMonitor(data: any) {
  try {
    const stmt_sql = `
      INSERT INTO transport_monitors (firstName, lastName, phone, assignedRouteId, status)
      VALUES (:firstName, :lastName, :phone, :assignedRouteId, :status)
    `;
    const [result] = await db.execute<any>(stmt_sql, data);
    revalidatePath('/transport/drivers');
    return { success: true, id: result.insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMonitor(id: number, data: any) {
  try {
    const stmt_sql = `
      UPDATE transport_monitors
      SET firstName = :firstName, lastName = :lastName, phone = :phone, 
          assignedRouteId = :assignedRouteId, status = :status
      WHERE id = :id
    `;
    await db.execute(stmt_sql, { ...data, id });
    revalidatePath('/transport/drivers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMonitor(id: number) {
  try {
    await db.execute(`DELETE FROM transport_monitors WHERE id = ?`, [id]);
    revalidatePath('/transport/drivers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// RUTAS
// ==========================================

export async function getRoutes() {
  const stmt_sql = `
    SELECT r.*, 
           v.plate as vehiclePlate, v.brand as vehicleBrand, v.model as vehicleModel,
           d.firstName as driverFirstName, d.lastName as driverLastName
    FROM transport_routes r
    LEFT JOIN transport_vehicles v ON r.vehicleId = v.id
    LEFT JOIN transport_drivers d ON r.driverId = d.id
    ORDER BY r.name
  `;
  const [routeRows] = await db.query(stmt_sql);
  const routes = routeRows as any[];
  
  // Attach stops
  const stopsStmt_sql = `SELECT * FROM transport_route_stops WHERE routeId = ? ORDER BY orderIndex`;
  for (const route of routes) {
    const [stops] = await db.query(stopsStmt_sql, [route.id]);
    route.stops = stops as any[];
  }
  return routes;
}

export async function createRoute(data: any) {
  try {
    await db.query('START TRANSACTION');
    const stmt_sql = `
      INSERT INTO transport_routes (name, sectors, departureTime, returnTime, vehicleId, driverId, status)
      VALUES (:name, :sectors, :departureTime, :returnTime, :vehicleId, :driverId, :status)
    `;
    const [result] = await db.execute<any>(stmt_sql, data);
    const routeId = result.insertId;

    if (data.stops && Array.isArray(data.stops)) {
      const stopStmt_sql = `INSERT INTO transport_route_stops (routeId, name, time, orderIndex) VALUES (?, ?, ?, ?)`;
      for (let idx = 0; idx < data.stops.length; idx++) {
        const stop = data.stops[idx];
        await db.execute(stopStmt_sql, [routeId, stop.name, stop.time, idx]);
      }
    }

    await db.query('COMMIT');
    revalidatePath('/transport');
    revalidatePath('/transport/routes');
    return { success: true, id: routeId };
  } catch (error: any) {
    await db.query('ROLLBACK');
    return { success: false, error: error.message };
  }
}

export async function updateRoute(id: number, data: any) {
  try {
    await db.query('START TRANSACTION');
    const stmt_sql = `
      UPDATE transport_routes
      SET name = :name, sectors = :sectors, departureTime = :departureTime, returnTime = :returnTime, 
          vehicleId = :vehicleId, driverId = :driverId, status = :status
      WHERE id = :id
    `;
    await db.execute(stmt_sql, { ...data, id });

    if (data.stops) {
      await db.execute(`DELETE FROM transport_route_stops WHERE routeId = ?`, [id]);
      const stopStmt_sql = `INSERT INTO transport_route_stops (routeId, name, time, orderIndex) VALUES (?, ?, ?, ?)`;
      for (let idx = 0; idx < data.stops.length; idx++) {
        const stop = data.stops[idx];
        await db.execute(stopStmt_sql, [id, stop.name, stop.time, idx]);
      }
    }

    await db.query('COMMIT');
    revalidatePath('/transport');
    revalidatePath('/transport/routes');
    return { success: true };
  } catch (error: any) {
    await db.query('ROLLBACK');
    return { success: false, error: error.message };
  }
}

export async function deleteRoute(id: number) {
  try {
    await db.execute(`DELETE FROM transport_routes WHERE id = ?`, [id]);
    revalidatePath('/transport');
    revalidatePath('/transport/routes');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// ASIGNACIONES (NIÑOS A RUTAS)
// ==========================================

export async function getAssignments() {
  const [rows] = await db.query(`
    SELECT a.*, 
           c.firstName as childFirstName, c.lastName as childLastName, c.photoUrl as childPhoto,
           r.name as routeName
    FROM transport_assignments a
    JOIN children c ON a.childId = c.id
    JOIN transport_routes r ON a.routeId = r.id
    ORDER BY r.name, c.firstName
  `);
  return rows as any[];
}

export async function createAssignment(data: any) {
  try {
    // Check if child is already assigned
    const check_sql = `SELECT id FROM transport_assignments WHERE childId = ?`;
    const [checkRows] = await db.query(check_sql, [data.childId]);
    const check = (checkRows as any[])[0];
    if (check) return { success: false, error: 'El niño ya está asignado a una ruta. Debe desasignarlo primero.' };

    const stmt_sql = `
      INSERT INTO transport_assignments (childId, routeId, pickupAddress, dropoffAddress, specialSchedule, authorizedPerson)
      VALUES (:childId, :routeId, :pickupAddress, :dropoffAddress, :specialSchedule, :authorizedPerson)
    `;
    const [result] = await db.execute<any>(stmt_sql, data);
    revalidatePath('/transport/assignments');
    revalidatePath('/transport');
    return { success: true, id: result.insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAssignment(id: number, data: any) {
  try {
    const stmt_sql = `
      UPDATE transport_assignments
      SET routeId = :routeId, pickupAddress = :pickupAddress, dropoffAddress = :dropoffAddress, 
          specialSchedule = :specialSchedule, authorizedPerson = :authorizedPerson
      WHERE id = :id
    `;
    await db.execute(stmt_sql, { ...data, id });
    revalidatePath('/transport/assignments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAssignment(id: number) {
  try {
    await db.execute(`DELETE FROM transport_assignments WHERE id = ?`, [id]);
    revalidatePath('/transport/assignments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// ASISTENCIA
// ==========================================

export async function getAttendanceByDate(date: string) {
  const [rows] = await db.query(`
    SELECT a.*,
           assig.childId, assig.routeId,
           c.firstName as childFirstName, c.lastName as childLastName,
           r.name as routeName
    FROM transport_attendance a
    JOIN transport_assignments assig ON a.assignmentId = assig.id
    JOIN children c ON assig.childId = c.id
    JOIN transport_routes r ON assig.routeId = r.id
    WHERE a.date = ?
  `, [date]);
  return rows as any[];
}

export async function recordAttendance(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No autorizado');

    const check_sql = `SELECT id FROM transport_attendance WHERE assignmentId = ? AND date = ?`;
    const [checkRows] = await db.query(check_sql, [data.assignmentId, data.date]);
    const check = (checkRows as any[])[0];
    
    if (check) {
      await db.execute(`
        UPDATE transport_attendance 
        SET pickupStatus = :pickupStatus, dropoffStatus = :dropoffStatus, notes = :notes, recordedBy = :recordedBy
        WHERE id = :id
      `, { ...data, recordedBy: user.id, id: check.id });
    } else {
      await db.execute(`
        INSERT INTO transport_attendance (assignmentId, date, pickupStatus, dropoffStatus, notes, recordedBy)
        VALUES (:assignmentId, :date, :pickupStatus, :dropoffStatus, :notes, :recordedBy)
      `, { ...data, recordedBy: user.id });
    }
    
    revalidatePath('/transport/attendance');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// GASTOS
// ==========================================

export async function getExpenses() {
  const [rows] = await db.query(`
    SELECT e.*, v.plate as vehiclePlate, v.brand as vehicleBrand, v.model as vehicleModel
    FROM transport_expenses e
    JOIN transport_vehicles v ON e.vehicleId = v.id
    ORDER BY e.date DESC, e.createdAt DESC
  `);
  return rows as any[];
}

export async function createExpense(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No autorizado');

    // 1. Insert into transport_expenses (operational record)
    const stmt_sql = `
      INSERT INTO transport_expenses (vehicleId, date, type, amount, description, recordedBy)
      VALUES (:vehicleId, :date, :type, :amount, :description, :recordedBy)
    `;
    const [result] = await db.execute<any>(stmt_sql, { ...data, recordedBy: user.id });
    const transportExpenseId = result.insertId;

    // 2. Mirror into finance expenses table (automatic sync — Option A)
    // Get vehicle info for the description
    const [vehicleRows] = await db.query<any[]>(
      `SELECT CONCAT(brand, ' ', model, ' (', plate, ')') as label FROM transport_vehicles WHERE id = ?`,
      [data.vehicleId]
    );
    const vehicleLabel = vehicleRows[0]?.label || `Vehículo #${data.vehicleId}`;
    const financeDescription = `[Transporte] ${data.type} - ${vehicleLabel}${data.description ? ': ' + data.description : ''}`;

    // Look for a default "Transporte" account in finance_accounts; if none, use NULL
    const [accountRows] = await db.query<any[]>(
      `SELECT id FROM finance_accounts WHERE name LIKE '%transporte%' OR name LIKE '%Transport%' LIMIT 1`
    );
    const accountId = accountRows[0]?.id || null;

    await db.execute(
      `INSERT INTO expenses (category, subcategory, amount, description, date, vendor, accountId, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Transporte', data.type, data.amount, financeDescription, data.date, 'Transporte Escolar', accountId, 'paid']
    );

    revalidatePath('/transport/expenses');
    revalidatePath('/finance/expenses');
    return { success: true, id: transportExpenseId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExpense(id: number) {
  try {
    await db.execute(`DELETE FROM transport_expenses WHERE id = ?`, [id]);
    revalidatePath('/transport/expenses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getTransportStats() {
  const [activeVehiclesRows] = await db.query(`SELECT count(*) as count FROM transport_vehicles WHERE status = 'Activo'`);
  const activeVehicles = (activeVehiclesRows as any[])[0];

  const [activeDriversRows] = await db.query(`SELECT count(*) as count FROM transport_drivers WHERE status = 'Activo'`);
  const activeDrivers = (activeDriversRows as any[])[0];

  const [activeRoutesRows] = await db.query(`SELECT count(*) as count FROM transport_routes WHERE status = 'Activo'`);
  const activeRoutes = (activeRoutesRows as any[])[0];

  const [totalAssignedChildrenRows] = await db.query(`SELECT count(*) as count FROM transport_assignments`);
  const totalAssignedChildren = (totalAssignedChildrenRows as any[])[0];
  
  // Expirations warning (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const [expiringInsurances] = await db.query(`SELECT code, plate, insuranceExpiration FROM transport_vehicles WHERE insuranceExpiration >= ? AND insuranceExpiration <= ? AND status = 'Activo'`, [todayStr, thirtyDaysStr]);
  const [expiringLicenses] = await db.query(`SELECT firstName, lastName, licenseExpiration FROM transport_drivers WHERE licenseExpiration >= ? AND licenseExpiration <= ? AND status = 'Activo'`, [todayStr, thirtyDaysStr]);

  return {
    activeVehicles: activeVehicles.count,
    activeDrivers: activeDrivers.count,
    activeRoutes: activeRoutes.count,
    totalAssignedChildren: totalAssignedChildren.count,
    expiringInsurances: expiringInsurances as any[],
    expiringLicenses: expiringLicenses as any[]
  };
}
