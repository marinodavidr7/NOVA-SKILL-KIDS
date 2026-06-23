'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getAttendanceByDate(date: string) {
  const [rows] = await db.query(`
    SELECT a.*, c.firstName, c.lastName, c.photoUrl
    FROM attendance a
    JOIN children c ON a.childId = c.id
    WHERE a.date = :date
    ORDER BY c.firstName
  `, { date });
  return rows as any[];
}

export async function getActiveChildren() {
  const [rows] = await db.query(`
    SELECT c.id, c.firstName, c.lastName, c.photoUrl,
           (SELECT sp.schedule_days FROM child_subscriptions cs JOIN subscription_packages sp ON cs.package_id = sp.id WHERE cs.child_id = c.id ORDER BY cs.created_at DESC LIMIT 1) as schedule_days,
           (SELECT sp.start_time FROM child_subscriptions cs JOIN subscription_packages sp ON cs.package_id = sp.id WHERE cs.child_id = c.id ORDER BY cs.created_at DESC LIMIT 1) as start_time,
           (SELECT sp.end_time FROM child_subscriptions cs JOIN subscription_packages sp ON cs.package_id = sp.id WHERE cs.child_id = c.id ORDER BY cs.created_at DESC LIMIT 1) as end_time
    FROM children c
    WHERE c.status = 'active'
    ORDER BY c.firstName
  `);
  return rows as any[];
}

export async function markAttendance(formData: FormData) {
  const childId = formData.get('childId') as string;
  const date = formData.get('date') as string;
  const checkIn = formData.get('checkIn') as string;
  const status = formData.get('status') as string;

  const [existingRows] = await db.query("SELECT id FROM attendance WHERE childId = :childId AND date = :date", { childId, date });
  const existing = (existingRows as any[])[0];
  
  if (existing) {
    await db.execute("UPDATE attendance SET checkIn = :checkIn, status = :status WHERE childId = :childId AND date = :date", { checkIn, status, childId, date });
  } else {
    await db.execute("INSERT INTO attendance (childId, date, checkIn, status) VALUES (:childId, :date, :checkIn, :status)", { childId, date, checkIn, status });
  }
  revalidatePath('/attendance');
}

export async function markCheckOut(formData: FormData) {
  const id = formData.get('id') as string;
  const checkOut = formData.get('checkOut') as string;
  await db.execute("UPDATE attendance SET checkOut = :checkOut WHERE id = :id", { checkOut, id });
  revalidatePath('/attendance');
}

export async function getAttendanceSummary() {
  const today = new Date().toISOString().split('T')[0];
  
  const [presentRows] = await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = :today AND status = 'present'", { today });
  const present = (presentRows as any[])[0];
  
  const [absentRows] = await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = :today AND status = 'absent'", { today });
  const absent = (absentRows as any[])[0];
  
  const [lateRows] = await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = :today AND status = 'late'", { today });
  const late = (lateRows as any[])[0];
  
  const [totalRows] = await db.query("SELECT COUNT(*) as count FROM children WHERE status = 'active'");
  const total = (totalRows as any[])[0];
  
  return { present: present.count, absent: absent.count, late: late.count, total: total.count };
}
