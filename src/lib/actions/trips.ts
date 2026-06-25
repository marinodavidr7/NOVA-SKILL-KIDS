'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';

// ==========================================
// EXCURSIONES / VIAJES
// ==========================================

export async function getTrips() {
  const [rows] = await db.query(`
    SELECT t.*, v.plate as vehiclePlate, v.brand as vehicleBrand,
           (SELECT COUNT(*) FROM transport_trip_participants p WHERE p.tripId = t.id AND p.attendanceStatus != 'Cancelado') as registeredCount
    FROM transport_trips t
    LEFT JOIN transport_vehicles v ON t.vehicleId = v.id
    ORDER BY t.date DESC, t.departureTime DESC
  `);
  return rows as any[];
}

export async function getTripById(id: number) {
  const [tripRows] = await db.query(`
    SELECT t.*, v.plate as vehiclePlate, v.brand as vehicleBrand
    FROM transport_trips t
    LEFT JOIN transport_vehicles v ON t.vehicleId = v.id
    WHERE t.id = ?
  `, [id]);
  const trip = (tripRows as any[])[0];

  if (!trip) return null;

  // Get Participants
  const [participants] = await db.query(`
    SELECT p.*, c.firstName, c.lastName, c.photoUrl
    FROM transport_trip_participants p
    JOIN children c ON p.childId = c.id
    WHERE p.tripId = ?
  `, [id]);
  
  trip.participants = participants as any[];

  // Get Finances (Income and Expenses)
  const reference = `TRIP-${id}`;
  
  const [incomeRows] = await db.query(`
    SELECT * FROM income WHERE reference = ?
  `, [reference]);
  trip.incomes = incomeRows as any[];

  const [expenseRows] = await db.query(`
    SELECT * FROM expenses WHERE reference = ?
  `, [reference]);
  trip.expenses = expenseRows as any[];

  return trip;
}

export async function createTrip(data: any) {
  try {
    await db.query('START TRANSACTION');

    // 1. Create Event
    const eventStmt = `
      INSERT INTO events (title, description, date, time, type)
      VALUES (?, ?, ?, ?, 'excursion')
    `;
    const [eventResult] = await db.execute<any>(eventStmt, [
      `Viaje: ${data.name}`,
      `Destino: ${data.destination}`,
      data.date,
      data.departureTime || '08:00'
    ]);
    const eventId = eventResult.insertId;

    // 2. Create Trip
    const tripStmt = `
      INSERT INTO transport_trips (name, destination, date, departureTime, returnTime, eventId, vehicleId, totalCapacity, costPerStudent, costPerAdult, status, notes)
      VALUES (:name, :destination, :date, :departureTime, :returnTime, :eventId, :vehicleId, :totalCapacity, :costPerStudent, :costPerAdult, :status, :notes)
    `;
    const [tripResult] = await db.execute<any>(tripStmt, {
      ...data,
      eventId,
      vehicleId: data.vehicleId || null,
      costPerStudent: data.costPerStudent || 0,
      costPerAdult: data.costPerAdult || 0,
      totalCapacity: data.totalCapacity || 50,
      status: 'Programado',
      notes: data.notes || ''
    });

    await db.query('COMMIT');
    revalidatePath('/transport/trips');
    revalidatePath('/dashboard/events');
    return { success: true, id: tripResult.insertId };
  } catch (error: any) {
    await db.query('ROLLBACK');
    return { success: false, error: error.message };
  }
}

export async function addTripParticipant(tripId: number, childId: number, accompanyingAdults: number, authorized: boolean) {
  try {
    const trip = await getTripById(tripId);
    if (!trip) throw new Error('Viaje no encontrado');

    const totalNewPeople = 1 + accompanyingAdults;
    const currentCount = trip.participants.reduce((sum: number, p: any) => sum + 1 + (p.accompanyingAdults || 0), 0);
    
    if (trip.totalCapacity && currentCount + totalNewPeople > trip.totalCapacity) {
      throw new Error('Capacidad máxima del viaje excedida');
    }

    // Comprobar que no está asignado
    if (trip.participants.some((p: any) => p.childId === childId)) {
        throw new Error('El niño ya está inscrito en el viaje');
    }

    const totalFee = (trip.costPerStudent || 0) + ((trip.costPerAdult || 0) * accompanyingAdults);

    const stmt = `
      INSERT INTO transport_trip_participants (tripId, childId, accompanyingAdults, authorized, totalFee, amountPaid, attendanceStatus)
      VALUES (?, ?, ?, ?, ?, 0, 'Confirmado')
    `;
    await db.execute(stmt, [tripId, childId, accompanyingAdults, authorized ? 1 : 0, totalFee]);

    revalidatePath(`/transport/trips/${tripId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTripParticipants(tripId: number, childIds: number[], accompanyingAdults: number, authorized: boolean) {
  try {
    const trip = await getTripById(tripId);
    if (!trip) throw new Error('Viaje no encontrado');

    const totalNewPeople = childIds.length + (childIds.length * accompanyingAdults);
    const currentCount = trip.participants.reduce((sum: number, p: any) => sum + 1 + (p.accompanyingAdults || 0), 0);
    
    if (trip.totalCapacity && currentCount + totalNewPeople > trip.totalCapacity) {
      throw new Error('Capacidad máxima del viaje excedida');
    }

    const totalFee = (trip.costPerStudent || 0) + ((trip.costPerAdult || 0) * accompanyingAdults);

    const stmt = `
      INSERT INTO transport_trip_participants (tripId, childId, accompanyingAdults, authorized, totalFee, amountPaid, attendanceStatus)
      VALUES (?, ?, ?, ?, ?, 0, 'Confirmado')
    `;
    
    for (const childId of childIds) {
      if (!trip.participants.some((p: any) => p.childId === childId)) {
        await db.execute(stmt, [tripId, childId, accompanyingAdults, authorized ? 1 : 0, totalFee]);
      }
    }

    revalidatePath(`/transport/trips/${tripId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addTripExpense(tripId: number, amount: number, description: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No autorizado');

    const reference = `TRIP-${tripId}`;
    
    const [accountRows] = await db.query<any[]>(
      `SELECT id FROM finance_accounts LIMIT 1`
    );
    const accountId = accountRows[0]?.id || null;

    await db.execute(
      `INSERT INTO expenses (category, amount, description, date, reference, accountId, status)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?)`,
      ['Excursiones', amount, description, reference, accountId, 'paid']
    );

    revalidatePath(`/transport/trips/${tripId}`);
    revalidatePath('/finance/expenses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function payTripFee(participantId: number, tripId: number, childId: number, amount: number, description: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No autorizado');

    const reference = `TRIP-${tripId}`;
    
    await db.query('START TRANSACTION');

    const [accountRows] = await db.query<any[]>(
      `SELECT id FROM finance_accounts LIMIT 1`
    );
    const accountId = accountRows[0]?.id || null;

    // Add Income
    await db.execute(
      `INSERT INTO income (type, amount, description, childId, date, reference, accountId, status)
       VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
      ['Excursión', amount, description, childId, reference, accountId, 'paid']
    );

    // Update Participant paid amount
    await db.execute(
      `UPDATE transport_trip_participants SET amountPaid = amountPaid + ? WHERE id = ?`,
      [amount, participantId]
    );

    await db.query('COMMIT');
    revalidatePath(`/transport/trips/${tripId}`);
    revalidatePath('/finance/income');
    return { success: true };
  } catch (error: any) {
    await db.query('ROLLBACK');
    return { success: false, error: error.message };
  }
}
