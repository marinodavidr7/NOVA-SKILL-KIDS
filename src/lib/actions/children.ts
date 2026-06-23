'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/actions/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getCentroSettings } from '@/lib/actions/settings';
export async function createChild(formData: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin' && !user?.permissions?.registerChild) throw new Error('No tienes permiso para registrar niños');

  // 1. Datos Personales del Niño
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const gender = formData.get('gender') as string;
  const classroomId = formData.get('classroomId') as string;
  
  const photo = formData.get('photo') as File | null;
  let photoUrl = null;

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
    photoUrl = `/uploads/${fileName}`;
  }

  // 2. Datos del Tutor Principal
  const tutorFirstName = formData.get('tutorFirstName') as string;
  const tutorLastName = formData.get('tutorLastName') as string;
  const tutorPhone = formData.get('tutorPhone') as string;
  const tutorEmail = formData.get('tutorEmail') as string;
  const tutorAddress = formData.get('tutorAddress') as string;
  const tutorRelationship = formData.get('tutorRelationship') as string;
  const tutorCedula = formData.get('tutorCedula') as string;

  // 3. Contactos de Emergencia
  const emergencyContactName = formData.get('emergencyContactName') as string;
  const emergencyContactPhone = formData.get('emergencyContactPhone') as string;
  const authorizedPickup = formData.get('authorizedPickup') as string;

  // 4. Datos Médicos
  const bloodType = formData.get('bloodType') as string;
  const allergies = formData.get('allergies') as string;
  const conditions = formData.get('conditions') as string;
  const vaccines = formData.get('vaccines') as string;
  const authorizedMeds = formData.get('authorizedMeds') as string;

  const existingParentId = formData.get('existingParentId') as string;

  // Transaction for safe insert
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // A) Insertar Niño
    const childStmt_sql = `
      INSERT INTO children (firstName, lastName, dateOfBirth, gender, photoUrl, classroomId)
      VALUES (:firstName, :lastName, :dateOfBirth, :gender, :photoUrl, :classroomId)
    `;
    const [childResult] = await conn.execute<ResultSetHeader>(childStmt_sql, { firstName, lastName, dateOfBirth, gender, photoUrl, classroomId: classroomId || null });
    const childId = childResult.insertId;

    // B) Insertar o Vincular Tutor Principal
    let parentId;
    if (existingParentId) {
      parentId = parseInt(existingParentId);
    } else {
      const parentStmt_sql = `
        INSERT INTO parents (firstName, lastName, cedula, phone, email, address)
        VALUES (:tutorFirstName, :tutorLastName, :tutorCedula, :tutorPhone, :tutorEmail, :tutorAddress)
      `;
      const [parentResult] = await conn.execute<ResultSetHeader>(parentStmt_sql, { tutorFirstName, tutorLastName, tutorCedula: tutorCedula || null, tutorPhone, tutorEmail: tutorEmail || null, tutorAddress: tutorAddress || null });
      parentId = parentResult.insertId;
    }

    // C) Vincular Tutor y Niño
    const childParentStmt_sql = `
      INSERT INTO child_parents (child_id, parent_id, relationship, isEmergencyContact, isAuthorizedToPickup)
      VALUES (:childId, :parentId, :tutorRelationship, :isEmergencyContact, :isAuthorizedToPickup)
    `;
    await conn.execute(childParentStmt_sql, { childId, parentId, tutorRelationship: tutorRelationship || 'Tutor', isEmergencyContact: 1, isAuthorizedToPickup: 1 });

    // D) Insertar Expediente Médico
    const medicalStmt_sql = `
      INSERT INTO medical_records (
        child_id, allergies, conditions, authorizedMeds, vaccines, notes,
        bloodType, emergencyContactName, emergencyContactPhone, authorizedPickup
      )
      VALUES (:childId, :allergies, :conditions, :authorizedMeds, :vaccines, :notes, :bloodType, :emergencyContactName, :emergencyContactPhone, :authorizedPickup)
    `;
    
    await conn.execute(medicalStmt_sql, {
      childId, 
      allergies: allergies || null, 
      conditions: conditions || null, 
      authorizedMeds: authorizedMeds || null, 
      vaccines: vaccines || null, 
      notes: null,
      bloodType: bloodType || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      authorizedPickup: authorizedPickup || null
    });
    
    // E) Opcional: Generar Factura de Matrícula Automática
    const generateInvoice = formData.get('generateInvoice') === 'on';
    if (generateInvoice) {
      const settings = await getCentroSettings();
      const matriculaAmount = settings.matriculaAmount !== undefined ? settings.matriculaAmount : 12000;
      const financeStmt_sql = `
        INSERT INTO income (amount, date, description, type, childId)
        VALUES (:amount, CURDATE(), :description, 'Matrículas', :childId)
      `;
      await conn.execute(financeStmt_sql, { amount: matriculaAmount, description: `Matrícula de Inscripción - ${firstName} ${lastName}`, childId });
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  revalidatePath('/children');
  redirect('/children');
}

export async function getChildren() {
  const stmt_sql = `
    SELECT c.*, 
           cls.name as classroomName,
           m.allergies,
           p.firstName as tutorFirstName,
           p.lastName as tutorLastName,
           cp.relationship as tutorRelationship,
           GROUP_CONCAT(cs.package_id) as activePackages
    FROM children c
    LEFT JOIN classrooms cls ON c.classroomId = cls.id
    LEFT JOIN medical_records m ON c.id = m.child_id
    LEFT JOIN child_parents cp ON c.id = cp.child_id AND cp.isEmergencyContact = 1
    LEFT JOIN parents p ON cp.parent_id = p.id
    LEFT JOIN child_subscriptions cs ON c.id = cs.child_id
    GROUP BY c.id
    ORDER BY c.createdAt DESC
  `;
  const [rows] = await db.query(stmt_sql);
  return rows as any[];
}

export async function deleteChild(childId: number) {
  const stmt_sql = 'DELETE FROM children WHERE id = :childId';
  await db.execute(stmt_sql, { childId });
  revalidatePath('/children');
}

export async function getChild(id: number) {
  const childStmt_sql = `
    SELECT c.*, cls.name as classroomName
    FROM children c
    LEFT JOIN classrooms cls ON c.classroomId = cls.id
    WHERE c.id = :id
  `;
  const [childRows] = await db.query<RowDataPacket[]>(childStmt_sql, { id });
  const child = childRows[0] as any;

  if (!child) return null;

  const parentsStmt_sql = `
    SELECT p.*, cp.relationship, cp.isEmergencyContact, cp.isAuthorizedToPickup
    FROM parents p
    JOIN child_parents cp ON p.id = cp.parent_id
    WHERE cp.child_id = :id
  `;
  const [parents] = await db.query(parentsStmt_sql, { id });

  const medicalStmt_sql = `
    SELECT * FROM medical_records WHERE child_id = :id
  `;
  const [medicalRows] = await db.query<RowDataPacket[]>(medicalStmt_sql, { id });
  const medical = medicalRows[0] as any;

  const evaluationsStmt_sql = `
    SELECT * FROM evaluations WHERE childId = :id ORDER BY date DESC
  `;
  const [evaluations] = await db.query(evaluationsStmt_sql, { id });

  return { ...child, parents, medical, evaluations };
}

export async function updateChild(id: number, formData: FormData) {
  // 1. Update main fields in children table
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const gender = formData.get('gender') as string;
  const classroomId = formData.get('classroomId') as string;
  const status = formData.get('status') as string;

  const photo = formData.get('photo') as File | null;
  let photoUrlQuery = '';
  const queryParams: any = { firstName, lastName, dateOfBirth, gender, classroomId: classroomId || null, status, id };

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
    queryParams.photoUrl = `/uploads/${fileName}`;
    photoUrlQuery = `, photoUrl = :photoUrl`;
  }

  // 2. Medical & Emergency fields
  const emergencyContactName = formData.get('emergencyContactName') as string;
  const emergencyContactPhone = formData.get('emergencyContactPhone') as string;
  const authorizedPickup = formData.get('authorizedPickup') as string;
  const bloodType = formData.get('bloodType') as string;
  const allergies = formData.get('allergies') as string;
  const conditions = formData.get('conditions') as string;
  const vaccines = formData.get('vaccines') as string;
  const authorizedMeds = formData.get('authorizedMeds') as string;

  // 3. Parent fields
  const existingParentId = formData.get('existingParentId') as string;
  const tutorFirstName = formData.get('tutorFirstName') as string;
  const tutorLastName = formData.get('tutorLastName') as string;
  const tutorCedula = formData.get('tutorCedula') as string;
  const tutorPhone = formData.get('tutorPhone') as string;
  const tutorEmail = formData.get('tutorEmail') as string;
  const tutorAddress = formData.get('tutorAddress') as string;
  const tutorRelationship = formData.get('tutorRelationship') as string;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const stmt_sql = `
      UPDATE children 
      SET firstName = :firstName, lastName = :lastName, dateOfBirth = :dateOfBirth, gender = :gender, classroomId = :classroomId, status = :status
      ${photoUrlQuery}
      WHERE id = :id
    `;
    await conn.execute(stmt_sql, { ...queryParams, status: status || 'active' });

    // Update parent if fields are provided
    if (tutorFirstName && tutorLastName) {
      let parentId;
      if (existingParentId) {
        parentId = parseInt(existingParentId);
        const parentStmt_sql = `
          UPDATE parents
          SET firstName = :tutorFirstName, lastName = :tutorLastName, cedula = :tutorCedula, phone = :tutorPhone, email = :tutorEmail, address = :tutorAddress
          WHERE id = :parentId
        `;
        await conn.execute(parentStmt_sql, { tutorFirstName, tutorLastName, tutorCedula: tutorCedula || null, tutorPhone, tutorEmail: tutorEmail || null, tutorAddress: tutorAddress || null, parentId });

        const childParentStmt_sql = `
          UPDATE child_parents
          SET relationship = :tutorRelationship
          WHERE child_id = :id AND parent_id = :parentId
        `;
        await conn.execute(childParentStmt_sql, { tutorRelationship: tutorRelationship || 'Tutor', id, parentId });
      } else {
        const parentStmt_sql = `
          INSERT INTO parents (firstName, lastName, cedula, phone, email, address)
          VALUES (:tutorFirstName, :tutorLastName, :tutorCedula, :tutorPhone, :tutorEmail, :tutorAddress)
        `;
        const [parentResult] = await conn.execute<ResultSetHeader>(parentStmt_sql, { tutorFirstName, tutorLastName, tutorCedula: tutorCedula || null, tutorPhone, tutorEmail: tutorEmail || null, tutorAddress: tutorAddress || null });
        parentId = parentResult.insertId;

        const childParentStmt_sql = `
          INSERT INTO child_parents (child_id, parent_id, relationship, isEmergencyContact, isAuthorizedToPickup)
          VALUES (:id, :parentId, :tutorRelationship, 1, 1)
        `;
        await conn.execute(childParentStmt_sql, { id, parentId, tutorRelationship: tutorRelationship || 'Tutor' });
      }
    }

    // Update medical records
    const medicalStmt_sql = `
      INSERT INTO medical_records (
        child_id, allergies, conditions, authorizedMeds, vaccines, 
        bloodType, emergencyContactName, emergencyContactPhone, authorizedPickup
      ) VALUES (
        :id, :allergies, :conditions, :authorizedMeds, :vaccines, 
        :bloodType, :emergencyContactName, :emergencyContactPhone, :authorizedPickup
      )
      ON DUPLICATE KEY UPDATE
        allergies = VALUES(allergies),
        conditions = VALUES(conditions),
        authorizedMeds = VALUES(authorizedMeds),
        vaccines = VALUES(vaccines),
        bloodType = VALUES(bloodType),
        emergencyContactName = VALUES(emergencyContactName),
        emergencyContactPhone = VALUES(emergencyContactPhone),
        authorizedPickup = VALUES(authorizedPickup)
    `;
    await conn.execute(medicalStmt_sql, {
      allergies: allergies || null,
      conditions: conditions || null,
      authorizedMeds: authorizedMeds || null,
      vaccines: vaccines || null,
      bloodType: bloodType || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      authorizedPickup: authorizedPickup || null,
      id
    });

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
  
  revalidatePath('/children');
  revalidatePath(`/children/${id}`);
  redirect(`/children/${id}`);
}

export async function getSiblings(childId: number) {
  const stmt_sql = `
    SELECT DISTINCT c.*, cp1.relationship as relation_to_parent, cp2.relationship as current_child_relation
    FROM children c
    JOIN child_parents cp1 ON c.id = cp1.child_id
    JOIN child_parents cp2 ON cp1.parent_id = cp2.parent_id
    WHERE cp2.child_id = :childId AND c.id != :childId
  `;
  const [rows] = await db.query(stmt_sql, { childId });
  return rows as any[];
}

export async function getActiveChildrenForDischarge() {
  const stmt_sql = `
    SELECT c.id, c.firstName, c.lastName, c.photoUrl, cls.name as classroomName
    FROM children c
    LEFT JOIN classrooms cls ON c.classroomId = cls.id
    WHERE c.status = 'active'
    ORDER BY c.firstName ASC, c.lastName ASC
  `;
  const [rows] = await db.query(stmt_sql);
  return rows as any[];
}

export async function getDischargedChildren() {
  const stmt_sql = `
    SELECT c.id, c.firstName, c.lastName, c.photoUrl, cls.name as classroomName,
           c.dismissalReason, c.dismissalDate, c.dismissalReport
    FROM children c
    LEFT JOIN classrooms cls ON c.classroomId = cls.id
    WHERE c.status = 'inactive' AND c.dismissalDate IS NOT NULL
    ORDER BY c.dismissalDate DESC
  `;
  const [rows] = await db.query(stmt_sql);
  return rows as any[];
}

export async function registerDischarge(childId: number, formData: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin' && !user?.permissions?.registerChild) {
    throw new Error('No tienes permiso para registrar egresos');
  }

  const dismissalReason = formData.get('dismissalReason') as string;
  const dismissalDate = formData.get('dismissalDate') as string;
  const dismissalReport = formData.get('dismissalReport') as string;

  const file = formData.get('dismissalFile') as File | null;
  let fileUrl = null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'discharges');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    fileUrl = `/uploads/discharges/${fileName}`;
  }

  const stmt_sql = `
    UPDATE children
    SET status = 'inactive',
        dismissalReason = :dismissalReason,
        dismissalDate = :dismissalDate,
        dismissalReport = :dismissalReport
    WHERE id = :childId
  `;
  await db.execute(stmt_sql, {
    dismissalReason: dismissalReason || null,
    dismissalDate: dismissalDate || null,
    dismissalReport: fileUrl ? `${dismissalReport || ''}\n\n[Documento Adjunto: ${fileUrl}]` : (dismissalReport || null),
    childId
  });

  revalidatePath('/children');
  revalidatePath('/discharges');
}
