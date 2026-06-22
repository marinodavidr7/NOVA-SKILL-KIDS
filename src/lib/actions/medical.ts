'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface MedicalRecord {
  id: number;
  childId: number;
  date: string;
  time: string;
  type: string;
  description: string;
  status: 'pending' | 'resolved';
  resolvedDate?: string;
  resolutionNotes?: string;
  createdAt: string;
  childFirstName?: string;
  childLastName?: string;
  childPhotoUrl?: string;
  classroomName?: string;
}

export interface ChildWithAllergy {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  classroomName?: string;
  allergies: string;
}

export async function getMedicalRecordsByChild(childId: number): Promise<MedicalRecord[]> {
  try {
    const [rows] = await db.query(`
      SELECT * FROM health_incidents 
      WHERE childId = :childId 
      ORDER BY date DESC, time DESC, id DESC
    `, { childId });
    return rows as MedicalRecord[];
  } catch (error) {
    console.error('Error fetching medical records for child:', error);
    return [];
  }
}

export async function getChildrenWithAllergies(): Promise<ChildWithAllergy[]> {
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.firstName, c.lastName, c.photoUrl, cl.name as classroomName, m.allergies
      FROM children c
      JOIN medical_records m ON c.id = m.child_id
      LEFT JOIN classrooms cl ON c.classroomId = cl.id
      WHERE m.allergies IS NOT NULL 
        AND trim(m.allergies) != '' 
        AND lower(trim(m.allergies)) NOT IN ('ninguna', 'ninguno', 'no', 'n/a', 'none', 'ninguna.', 'ninguno.')
      ORDER BY c.firstName ASC
    `);
    return rows as ChildWithAllergy[];
  } catch (error) {
    console.error('Error fetching children with allergies:', error);
    return [];
  }
}

export async function getAllActiveMedicalRecords(): Promise<MedicalRecord[]> {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.firstName as childFirstName, c.lastName as childLastName, c.photoUrl as childPhotoUrl, cl.name as classroomName
      FROM health_incidents m
      JOIN children c ON m.childId = c.id
      LEFT JOIN classrooms cl ON c.classroomId = cl.id
      WHERE m.status = 'pending'
      ORDER BY m.date ASC, m.time ASC
    `);
    return rows as MedicalRecord[];
  } catch (error) {
    console.error('Error fetching active medical records:', error);
    return [];
  }
}

export async function createMedicalRecord(data: {
  childId: number;
  date: string;
  time: string;
  type: string;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await db.execute(`
      INSERT INTO health_incidents (childId, date, time, type, description, status, createdAt)
      VALUES (:childId, :date, :time, :type, :description, 'pending', NOW())
    `, { childId: data.childId, date: data.date, time: data.time, type: data.type, description: data.description });
    
    revalidatePath(`/children/${data.childId}`);
    revalidatePath('/health');
    return { success: true };
  } catch (error) {
    console.error('Error creating medical record:', error);
    return { success: false, error: 'Error al crear el registro médico' };
  }
}

export async function resolveMedicalRecord(id: number, resolutionNotes: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [rows] = await db.query('SELECT childId FROM health_incidents WHERE id = :id', { id }) as any[];
    const record = rows[0];
    
    await db.execute(`
      UPDATE health_incidents 
      SET status = 'resolved', resolvedDate = CURDATE(), resolutionNotes = :resolutionNotes
      WHERE id = :id
    `, { resolutionNotes, id });
    
    if (record) {
      revalidatePath(`/children/${record.childId}`);
    }
    revalidatePath('/health');
    return { success: true };
  } catch (error) {
    console.error('Error resolving medical record:', error);
    return { success: false, error: 'Error al finalizar el caso médico' };
  }
}
