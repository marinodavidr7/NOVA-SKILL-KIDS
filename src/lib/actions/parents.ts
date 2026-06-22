'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import fs from 'fs';
import path from 'path';

async function handleFileUpload(formData: FormData, fieldName: string): Promise<string | null> {
  const photo = formData.get(fieldName) as File | null;
  if (photo && photo.size > 0) {
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${photo.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${fileName}`;
  }
  return null;
}

export async function createParent(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const cedula = formData.get('cedula') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  const photoUrl = await handleFileUpload(formData, 'photo');

  const stmt_sql = `
    INSERT INTO parents (firstName, lastName, cedula, phone, email, address, photoUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await db.execute(stmt_sql, [firstName, lastName, cedula || null, phone, email, address, photoUrl]);

  revalidatePath('/parents');
  redirect('/parents');
}

export async function getParents() {
  const stmt_sql = "SELECT * FROM parents ORDER BY createdAt DESC";
  const [rows] = await db.query(stmt_sql);
  return rows as any[];
}

export async function getParentById(id: number) {
  const stmt_sql = "SELECT * FROM parents WHERE id = ?";
  const [rows] = await db.query(stmt_sql, [id]);
  const parent = (rows as any[])[0];

  if (!parent) return null;

  // Get associated children
  const childrenStmt_sql = `
    SELECT c.*, cp.relationship 
    FROM children c
    JOIN child_parents cp ON c.id = cp.child_id
    WHERE cp.parent_id = ?
  `;
  const [children] = await db.query(childrenStmt_sql, [id]);

  return { ...parent, children: children as any[] };
}

export async function deleteParent(parentId: number) {
  const stmt_sql = 'DELETE FROM parents WHERE id = ?';
  await db.execute(stmt_sql, [parentId]);
  revalidatePath('/parents');
}

export async function updateParent(id: number, formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const cedula = formData.get('cedula') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  
  const photoUrl = await handleFileUpload(formData, 'photo');

  if (photoUrl) {
    const stmt_sql = `
      UPDATE parents 
      SET firstName = ?, lastName = ?, cedula = ?, phone = ?, email = ?, address = ?, photoUrl = ?
      WHERE id = ?
    `;
    await db.execute(stmt_sql, [firstName, lastName, cedula || null, phone, email, address, photoUrl, id]);
  } else {
    const stmt_sql = `
      UPDATE parents 
      SET firstName = ?, lastName = ?, cedula = ?, phone = ?, email = ?, address = ?
      WHERE id = ?
    `;
    await db.execute(stmt_sql, [firstName, lastName, cedula || null, phone, email, address, id]);
  }
  
  revalidatePath('/parents');
  revalidatePath(`/parents/${id}`);
  redirect('/parents');
}
