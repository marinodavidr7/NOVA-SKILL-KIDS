'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getLessonPlans() {
  const [rows] = await db.query(`
    SELECT lp.*, c.name as classroomName FROM lesson_plans lp
    LEFT JOIN classrooms c ON lp.classroomId = c.id
    ORDER BY lp.date DESC
  `);
  return rows as any[];
}

export async function createLessonPlan(formData: FormData) {
  const classroomId = formData.get('classroomId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const objectives = formData.get('objectives') as string;
  const materials = formData.get('materials') as string;

  await db.execute("INSERT INTO lesson_plans (classroomId, title, description, date, objectives, materials) VALUES (?, ?, ?, ?, ?, ?)",
    [classroomId || null, title, description, date, objectives, materials]);
  revalidatePath('/education');
  redirect('/education');
}

export async function getEvaluations() {
  const [rows] = await db.query(`
    SELECT e.*, c.firstName, c.lastName FROM evaluations e
    JOIN children c ON e.childId = c.id
    ORDER BY e.date DESC
  `);
  return rows as any[];
}

export async function createEvaluation(formData: FormData) {
  const childId = formData.get('childId') as string;
  const area = formData.get('area') as string;
  const score = formData.get('score') as string;
  const observations = formData.get('observations') as string;
  const date = formData.get('date') as string;
  const evaluator = formData.get('evaluator') as string;
  const results = formData.get('results') as string;

  await db.execute("INSERT INTO evaluations (childId, area, score, observations, date, evaluator, results) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [childId, area || 'Desarrollo Integral', score || '', observations, date, evaluator, results || null]);
  revalidatePath('/education');
  revalidatePath(`/children/${childId}`);
  redirect(`/children/${childId}`);
}

export async function getEvaluation(id: number | string) {
  const [rows] = await db.query(`SELECT * FROM evaluations WHERE id = ?`, [id]);
  const evaluations = rows as any[];
  return evaluations.length > 0 ? evaluations[0] : null;
}

export async function updateEvaluation(id: number | string, formData: FormData) {
  const childId = formData.get('childId') as string;
  const area = formData.get('area') as string;
  const score = formData.get('score') as string;
  const observations = formData.get('observations') as string;
  const date = formData.get('date') as string;
  const evaluator = formData.get('evaluator') as string;
  const results = formData.get('results') as string;

  await db.execute(
    "UPDATE evaluations SET childId = ?, area = ?, score = ?, observations = ?, date = ?, evaluator = ?, results = ? WHERE id = ?",
    [childId, area || 'Desarrollo Integral', score || '', observations, date, evaluator, results || null, id]
  );
  
  revalidatePath('/education');
  if (childId) {
    revalidatePath(`/children/${childId}`);
    redirect(`/children/${childId}`);
  } else {
    redirect('/education');
  }
}
