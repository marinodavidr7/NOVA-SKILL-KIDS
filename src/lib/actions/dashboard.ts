'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getDashboardStats() {
  // 1. Niños activos
  const [activeChildrenRow] = await db.query("SELECT COUNT(*) as count FROM children WHERE status = 'active'");
  const activeChildren = (activeChildrenRow as any[])[0].count;

  // 2. Personal activo
  const [activeStaffRow] = await db.query("SELECT COUNT(*) as count FROM staff WHERE status = 'active'");
  const activeStaff = (activeStaffRow as any[])[0].count;

  // 3. Asistencia Hoy
  const today = new Date().toISOString().split('T')[0];
  const [attendanceRow] = await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'present'", [today]);
  const attendanceToday = (attendanceRow as any[])[0].count;

  // 4. Ingresos del Mes (Reusing logic from finance)
  const [monthIncomeRow] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM income WHERE DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')");
  const monthIncome = (monthIncomeRow as any[])[0].total;

  return {
    activeChildren,
    activeStaff,
    attendanceToday,
    monthIncome
  };
}

export async function getUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // 1. Get real events from DB
  const [dbEvents] = await db.query(`
    SELECT id, title, description, date, time, type 
    FROM events 
    WHERE date >= ? 
  `, [todayStr]);

  const allEvents = [...(dbEvents as any[])];

  // Helper to calculate next birthday
  const getNextBirthday = (dobInput: string | Date) => {
    if (!dobInput) return null;
    const dob = dobInput instanceof Date ? dobInput : new Date(`${dobInput}T12:00:00`);
    // adjust to noon to avoid timezone shift 
    const nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate(), 12, 0, 0);
    
    // Si ya pasó, no lo mostramos este año (como pidió el usuario)
    if (nextBday < today) {
      return null; 
    }
    return { nextBday, dob };
  };

  // 2. Get active children birthdays
  const [activeChildren] = await db.query("SELECT id, firstName, lastName, dateOfBirth FROM children WHERE status = 'active'");
  for (const child of activeChildren as any[]) {
    const bdayInfo = getNextBirthday(child.dateOfBirth);
    if (bdayInfo) {
      const ageTurning = bdayInfo.nextBday.getFullYear() - bdayInfo.dob.getFullYear();
      allEvents.push({
        id: `child_bday_${child.id}_${bdayInfo.nextBday.getFullYear()}`,
        title: `🎂 Cumpleaños de ${child.firstName} ${child.lastName}`,
        description: `Cumple ${ageTurning} añitos!`,
        date: bdayInfo.nextBday.toISOString().split('T')[0],
        time: 'Todo el día',
        type: 'birthday'
      });
    }
  }

  // 3. Get active staff birthdays
  const [activeStaff] = await db.query("SELECT id, firstName, lastName, birthDate FROM staff WHERE status = 'active' AND birthDate IS NOT NULL");
  for (const staff of activeStaff as any[]) {
    const bdayInfo = getNextBirthday(staff.birthDate);
    if (bdayInfo) {
      allEvents.push({
        id: `staff_bday_${staff.id}_${bdayInfo.nextBday.getFullYear()}`,
        title: `🎉 Cumpleaños de ${staff.firstName} ${staff.lastName} (Personal)`,
        description: `¡Día de celebración para nuestro equipo!`,
        date: bdayInfo.nextBday.toISOString().split('T')[0],
        time: 'Todo el día',
        type: 'birthday'
      });
    }
  }

  // Sort all events by date
  allEvents.sort((a, b) => new Date(`${a.date}T12:00:00`).getTime() - new Date(`${b.date}T12:00:00`).getTime());

  // Return the top 4
  return allEvents.slice(0, 4);
}

export async function createEvent(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const type = formData.get('type') as string || 'general';

  await db.execute(`
    INSERT INTO events (title, description, date, time, type)
    VALUES (?, ?, ?, ?, ?)
  `, [title, description, date, time, type]);

  revalidatePath('/');
}

export async function deleteEvent(id: number) {
  await db.execute('DELETE FROM events WHERE id = ?', [id]);
  revalidatePath('/');
}
