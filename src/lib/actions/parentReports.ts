'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getReportsByParent(parentId: number) {
  const [rows] = await db.query(`
    SELECT pr.*, e.title as eventTitle 
    FROM parent_reports pr
    LEFT JOIN events e ON pr.eventId = e.id
    WHERE pr.parentId = :parentId
    ORDER BY pr.date DESC, pr.createdAt DESC
  `, { parentId });
  return rows as any[];
}

export async function createParentReport(data: any) {
  try {
    const [result] = await db.execute(`
      INSERT INTO parent_reports (parentId, eventId, type, date, title, description, attended)
      VALUES (:parentId, :eventId, :type, :date, :title, :description, :attended)
    `, {
      parentId: data.parentId,
      eventId: data.eventId || null,
      type: data.type,
      date: data.date,
      title: data.title,
      description: data.description || null,
      attended: data.attended !== undefined ? (data.attended ? 1 : 0) : null
    }) as any[];

    revalidatePath(`/parents/${data.parentId}`);
    return { success: true, id: result.insertId };
  } catch (error: any) {
    console.error('Error creating parent report:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteParentReport(id: number, parentId: number) {
  try {
    await db.execute(`DELETE FROM parent_reports WHERE id = :id`, { id });
    revalidatePath(`/parents/${parentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting parent report:', error);
    return { success: false, error: error.message };
  }
}

export async function getEventsForDropdown() {
  const [rows] = await db.query(`SELECT id, title, date, time FROM events ORDER BY date DESC LIMIT 50`);
  return rows as any[];
}
