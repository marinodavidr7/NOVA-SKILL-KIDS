'use server';

import { db } from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { revalidatePath } from 'next/cache';

export interface Subject {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  rubrics?: Rubric[];
}

export interface Rubric {
  id?: number;
  subject_id: number;
  name: string;
  weight: number;
  description?: string;
}

export async function getSubjects() {
  const [subjects] = await db.query<RowDataPacket[]>('SELECT * FROM subjects ORDER BY name ASC');
  
  const [rubrics] = await db.query<RowDataPacket[]>('SELECT * FROM rubrics ORDER BY id ASC');
  
  return subjects.map(subject => ({
    ...subject,
    rubrics: rubrics.filter(r => r.subject_id === subject.id)
  })) as Subject[];
}

export async function createSubject(data: Subject) {
  const [result] = await db.query<ResultSetHeader>(
    'INSERT INTO subjects (name, description, icon, color) VALUES (?, ?, ?, ?)',
    [data.name, data.description || null, data.icon || '📚', data.color || 'bg-indigo-100 text-indigo-700']
  );
  revalidatePath('/academic/planning');
  return result.insertId;
}

export async function updateSubject(id: number, data: Partial<Subject>) {
  const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'rubrics');
  if (keys.length === 0) return true;
  
  const values = keys.map(k => (data as any)[k]);
  
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE subjects SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`,
    [...values, id]
  );
  revalidatePath('/academic/planning');
  return result.affectedRows > 0;
}

export async function deleteSubject(id: number) {
  const [result] = await db.query<ResultSetHeader>('DELETE FROM subjects WHERE id = ?', [id]);
  revalidatePath('/academic/planning');
  return result.affectedRows > 0;
}

export async function createRubric(data: Rubric) {
  const [result] = await db.query<ResultSetHeader>(
    'INSERT INTO rubrics (subject_id, name, weight, description) VALUES (?, ?, ?, ?)',
    [data.subject_id, data.name, data.weight || 0, data.description || null]
  );
  revalidatePath('/academic/planning');
  return result.insertId;
}

export async function deleteRubric(id: number) {
  const [result] = await db.query<ResultSetHeader>('DELETE FROM rubrics WHERE id = ?', [id]);
  revalidatePath('/academic/planning');
  return result.affectedRows > 0;
}
