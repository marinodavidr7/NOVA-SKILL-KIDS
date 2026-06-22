'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { RowDataPacket } from 'mysql2';
import { getCentroSettings } from '@/lib/actions/settings';
export async function getClassrooms() {
  const [rows] = await db.query(`
    SELECT c.*, COUNT(ch.id) as currentOccupancy
    FROM classrooms c
    LEFT JOIN children ch ON c.id = ch.classroomId AND ch.status = 'active'
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  return rows as any[];
}

export async function getClassroomById(id: number) {
  const classroomStmt_sql = "SELECT * FROM classrooms WHERE id = :id";
  const [classroomRows] = await db.query<RowDataPacket[]>(classroomStmt_sql, { id });
  const classroom = classroomRows[0] as any;
  
  if (!classroom) return null;

  const childrenStmt_sql = `
    SELECT id, firstName, lastName, dateOfBirth, gender, photoUrl 
    FROM children 
    WHERE classroomId = :id AND status = 'active'
    ORDER BY firstName ASC
  `;
  const [children] = await db.query(childrenStmt_sql, { id });

  const availableChildrenStmt_sql = `
    SELECT id, firstName, lastName, dateOfBirth 
    FROM children 
    WHERE (classroomId IS NULL OR classroomId != :id) AND status = 'active'
    ORDER BY firstName ASC
  `;
  const [availableChildrenRows] = await db.query(availableChildrenStmt_sql, { id });
  let availableChildren = availableChildrenRows as any[];

  const settings = await getCentroSettings();
  if (settings.strictAgeFiltering !== false) {
    const minAge = classroom.minAge || 0;
    const maxAge = classroom.maxAge || 99;
    const currentYear = new Date().getFullYear();
    availableChildren = availableChildren.filter(child => {
      if (!child.dateOfBirth) return false;
      const age = currentYear - new Date(child.dateOfBirth).getFullYear();
      return age >= minAge && age <= maxAge;
    });
  }

  return { ...classroom, children: children as any[], availableChildren };
}

export async function createClassroom(formData: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin' && !user?.permissions?.createClassroom) throw new Error('No tienes permiso para crear aulas');

  const name = formData.get('name') as string;
  const capacity = parseInt(formData.get('capacity') as string) || 20;
  const minAge = parseInt(formData.get('minAge') as string) || 0;
  const maxAge = parseInt(formData.get('maxAge') as string) || 6;
  const description = formData.get('description') as string;

  await db.execute(`
    INSERT INTO classrooms (name, capacity, minAge, maxAge, description)
    VALUES (:name, :capacity, :minAge, :maxAge, :description)
  `, { name, capacity, minAge, maxAge, description });

  revalidatePath('/classrooms');
  redirect('/classrooms');
}

export async function assignChildToClassroom(formData: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin' && !user?.permissions?.assignChild) throw new Error('No tienes permiso para agregar niños a aulas');

  const childIds = formData.getAll('childId') as string[];
  const classroomId = formData.get('classroomId') as string;

  if (childIds.length > 0 && classroomId) {
    for (const childId of childIds) {
      await db.execute("UPDATE children SET classroomId = :classroomId WHERE id = :childId", { classroomId, childId });
    }
    revalidatePath(`/classrooms/${classroomId}`);
  }
}

export async function removeChildFromClassroom(childId: number, classroomId: number) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin' && !user?.permissions?.removeChild) throw new Error('No tienes permiso para remover niños de aulas');
  await db.execute("UPDATE children SET classroomId = NULL WHERE id = :childId", { childId });
  revalidatePath(`/classrooms/${classroomId}`);
}

export async function updateClassroom(formData: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin' && !user?.permissions?.editClassroom) throw new Error('No tienes permiso para editar aulas');

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const capacity = parseInt(formData.get('capacity') as string) || 20;
  const minAge = parseInt(formData.get('minAge') as string) || 0;
  const maxAge = parseInt(formData.get('maxAge') as string) || 6;
  const description = formData.get('description') as string;

  await db.execute(`
    UPDATE classrooms 
    SET name = :name, capacity = :capacity, minAge = :minAge, maxAge = :maxAge, description = :description
    WHERE id = :id
  `, { name, capacity, minAge, maxAge, description, id });

  revalidatePath('/classrooms');
  revalidatePath(`/classrooms/${id}`);
  redirect(`/classrooms/${id}`);
}

export async function deleteClassroom(formData: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin' && !user?.permissions?.deleteClassroom) throw new Error('No tienes permiso para eliminar aulas');

  const id = formData.get('id') as string;
  
  // Detach all children from this classroom
  await db.execute("UPDATE children SET classroomId = NULL WHERE classroomId = :id", { id });
  
  // Delete the classroom
  await db.execute("DELETE FROM classrooms WHERE id = :id", { id });

  revalidatePath('/classrooms');
  redirect('/classrooms');
}
