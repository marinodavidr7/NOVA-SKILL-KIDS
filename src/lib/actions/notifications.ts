'use server';

import { db } from '@/lib/db';

export type Notification = {
  id: string;
  title: string;
  description: string;
  type: 'alert' | 'info' | 'success';
  time: string;
  unread: boolean;
};

export async function getNotifications(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Low Inventory Alerts
  try {
    const [lowInventory] = await db.query(`
      SELECT name, quantity, minStock 
      FROM inventory 
      WHERE quantity <= minStock
    `) as any[];

    for (const item of lowInventory) {
      notifications.push({
        id: `inv_${item.name}`,
        title: 'Inventario Bajo',
        description: `El artículo "${item.name}" está por agotarse. Quedan ${item.quantity} (Mínimo: ${item.minStock}).`,
        type: 'alert',
        time: 'Reciente',
        unread: true
      });
    }
  } catch (e) {
    console.error("Error fetching inventory notifications:", e);
  }

  // 2. Pending Staff Leaves
  try {
    const [pendingLeaves] = await db.query(`
      SELECT l.id, s.firstName, s.lastName, l.type, l.startDate 
      FROM staff_leaves l
      JOIN staff s ON l.staffId = s.id
      WHERE l.status = 'pending'
    `) as any[];

    for (const leave of pendingLeaves) {
      notifications.push({
        id: `leave_${leave.id}`,
        title: 'Permiso Pendiente',
        description: `${leave.firstName} ${leave.lastName} ha solicitado un permiso (${leave.type}) a partir del ${leave.startDate}.`,
        type: 'info',
        time: 'Pendiente de revisión',
        unread: true
      });
    }
  } catch (e) {
    console.error("Error fetching leave notifications:", e);
  }

  // 3. Upcoming Events
  try {
    const [upcomingEvents] = await db.query(`
      SELECT id, title, date, time 
      FROM events 
      WHERE date >= :todayStr AND date <= DATE_ADD(:todayStr, INTERVAL 7 DAY)
      ORDER BY date ASC
    `, { todayStr }) as any[];

    for (const event of upcomingEvents) {
      notifications.push({
        id: `event_${event.id}`,
        title: 'Evento Próximo',
        description: `El evento "${event.title}" está programado para el ${event.date} a las ${event.time || 'hora por definir'}.`,
        type: 'info',
        time: 'Próximamente',
        unread: false
      });
    }
  } catch (e) {
    console.error("Error fetching event notifications:", e);
  }

  // 4. Recent Enrollments (Children added in the last 7 days)
  try {
    const [recentChildren] = await db.query(`
      SELECT id, firstName, lastName, createdAt 
      FROM children 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY createdAt DESC
    `) as any[];

    for (const child of recentChildren) {
      notifications.push({
        id: `child_${child.id}`,
        title: 'Nuevo Ingreso',
        description: `El alumno ${child.firstName} ${child.lastName} fue registrado en el sistema.`,
        type: 'success',
        time: 'Nuevo',
        unread: true
      });
    }
  } catch (e) {
    console.error("Error fetching children notifications:", e);
  }

  // 5. Upcoming Birthdays (within 10 days)
  try {
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    const getNextBirthday = (dobStr: string) => {
      if (!dobStr) return null;
      const dob = new Date(`${dobStr}T12:00:00`);
      const nextBday = new Date(todayObj.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBday < todayObj) {
        nextBday.setFullYear(todayObj.getFullYear() + 1);
      }
      return nextBday;
    };

    const maxDate = new Date(todayObj);
    maxDate.setDate(todayObj.getDate() + 10);

    // Active children
    const [activeChildren] = await db.query("SELECT id, firstName, lastName, dateOfBirth FROM children WHERE status = 'active'") as any[];
    for (const child of activeChildren) {
      const nextBday = getNextBirthday(child.dateOfBirth);
      if (nextBday && nextBday <= maxDate) {
        const daysAway = Math.ceil((nextBday.getTime() - todayObj.getTime()) / (1000 * 3600 * 24));
        const ageTurning = nextBday.getFullYear() - new Date(`${child.dateOfBirth}T12:00:00`).getFullYear();
        notifications.push({
          id: `child_bday_alert_${child.id}_${nextBday.getFullYear()}`,
          title: 'Cumpleaños Próximo',
          description: `El alumno ${child.firstName} ${child.lastName} cumplirá ${ageTurning} años en ${daysAway === 0 ? 'el día de hoy' : `${daysAway} días`}.`,
          type: 'info',
          time: daysAway === 0 ? 'Hoy' : `${daysAway} días`,
          unread: true
        });
      }
    }

    // Active staff
    const [activeStaff] = await db.query("SELECT id, firstName, lastName, birthDate FROM staff WHERE status = 'active' AND birthDate IS NOT NULL") as any[];
    for (const staff of activeStaff) {
      const nextBday = getNextBirthday(staff.birthDate);
      if (nextBday && nextBday <= maxDate) {
        const daysAway = Math.ceil((nextBday.getTime() - todayObj.getTime()) / (1000 * 3600 * 24));
        notifications.push({
          id: `staff_bday_alert_${staff.id}_${nextBday.getFullYear()}`,
          title: 'Cumpleaños del Personal',
          description: `${staff.firstName} ${staff.lastName} cumple años en ${daysAway === 0 ? 'el día de hoy' : `${daysAway} días`}.`,
          type: 'info',
          time: daysAway === 0 ? 'Hoy' : `${daysAway} días`,
          unread: true
        });
      }
    }
  } catch (e) {
    console.error("Error fetching birthday notifications:", e);
  }

  // If there are no notifications at all, add a placeholder success message
  if (notifications.length === 0) {
    notifications.push({
      id: 'all_good',
      title: 'Todo al día',
      description: 'No tienes alertas pendientes en este momento. ¡Excelente trabajo!',
      type: 'success',
      time: 'Ahora',
      unread: false
    });
  }

  // Verificar cuáles ya han sido leídas
  try {
    const [rows] = await db.query('SELECT id FROM read_notifications') as any[];
    const readIds = rows.map((row: any) => row.id);
    const readSet = new Set(readIds);

    for (const notif of notifications) {
      if (readSet.has(notif.id)) {
        notif.unread = false;
      }
    }
  } catch (e) {
    console.error("Error checking read notifications:", e);
  }

  return notifications;
}

export async function markNotificationAsRead(id: string) {
  try {
    await db.execute('INSERT IGNORE INTO read_notifications (id) VALUES (:id)', { id });
    return { success: true };
  } catch (e) {
    console.error("Error marking notification as read:", e);
    return { success: false };
  }
}
