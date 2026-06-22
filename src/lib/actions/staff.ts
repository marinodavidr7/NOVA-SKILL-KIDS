'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import fs from 'fs';
import path from 'path';

export async function getStaff() {
  const [rows] = await db.query("SELECT * FROM staff ORDER BY firstName");
  return rows as any[];
}

export async function getStaffById(id: number) {
  const [rows] = await db.query("SELECT * FROM staff WHERE id = ?", [id]);
  return (rows as any[])[0];
}

export async function createStaff(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const hireDate = formData.get('hireDate') as string;
  const salary = parseFloat(formData.get('salary') as string) || 0;
  
  const dni = formData.get('dni') as string || null;
  const birthDate = formData.get('birthDate') as string || null;
  const address = formData.get('address') as string || null;
  const emergencyName = formData.get('emergencyName') as string || null;
  const emergencyPhone = formData.get('emergencyPhone') as string || null;
  const emergencyRelation = formData.get('emergencyRelation') as string || null;
  const bankName = formData.get('bankName') as string || null;
  const bankAccount = formData.get('bankAccount') as string || null;
  
  // Datos académicos
  const degree = formData.get('degree') as string || null;
  const institution = formData.get('institution') as string || null;
  const graduationYear = formData.get('graduationYear') ? parseInt(formData.get('graduationYear') as string, 10) : null;
  const specialties = formData.get('specialties') as string || null;

  // Photo
  let photoUrl = null;
  const photoFile = formData.get('photo') as File | null;
  if (photoFile && photoFile.size > 0) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'staff');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${photoFile.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await photoFile.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    photoUrl = `/uploads/staff/${fileName}`;
  }

  await db.execute(`
    INSERT INTO staff (
      firstName, lastName, role, phone, email, hireDate, salary,
      dni, birthDate, address, emergencyName, emergencyPhone, emergencyRelation, bankName, bankAccount,
      degree, institution, graduationYear, specialties, photoUrl
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    firstName, lastName, role, phone, email, hireDate, salary,
    dni, birthDate, address, emergencyName, emergencyPhone, emergencyRelation, bankName, bankAccount,
    degree, institution, graduationYear, specialties, photoUrl
  ]);
  
  revalidatePath('/staff');
  redirect('/staff');
}

export async function updateStaff(formData: FormData) {
  const id = parseInt(formData.get('id') as string, 10);
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const hireDate = formData.get('hireDate') as string;
  const salary = parseFloat(formData.get('salary') as string) || 0;
  const status = formData.get('status') as string || 'active';
  
  const dni = formData.get('dni') as string || null;
  const birthDate = formData.get('birthDate') as string || null;
  const address = formData.get('address') as string || null;
  const emergencyName = formData.get('emergencyName') as string || null;
  const emergencyPhone = formData.get('emergencyPhone') as string || null;
  const emergencyRelation = formData.get('emergencyRelation') as string || null;
  const bankName = formData.get('bankName') as string || null;
  const bankAccount = formData.get('bankAccount') as string || null;

  // Datos académicos
  const degree = formData.get('degree') as string || null;
  const institution = formData.get('institution') as string || null;
  const graduationYear = formData.get('graduationYear') ? parseInt(formData.get('graduationYear') as string, 10) : null;
  const specialties = formData.get('specialties') as string || null;
  // Photo
  let photoUrl = null;
  const photoFile = formData.get('photo') as File | null;
  if (photoFile && photoFile.size > 0) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'staff');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${photoFile.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await photoFile.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    photoUrl = `/uploads/staff/${fileName}`;
  }

  await db.execute(`
    UPDATE staff SET
      firstName = ?, lastName = ?, role = ?, phone = ?, email = ?, hireDate = ?, salary = ?, status = ?,
      dni = ?, birthDate = ?, address = ?, emergencyName = ?, emergencyPhone = ?, emergencyRelation = ?, bankName = ?, bankAccount = ?,
      degree = ?, institution = ?, graduationYear = ?, specialties = ?, photoUrl = COALESCE(?, photoUrl)
    WHERE id = ?
  `, [
    firstName, lastName, role, phone, email, hireDate, salary, status,
    dni, birthDate, address, emergencyName, emergencyPhone, emergencyRelation, bankName, bankAccount,
    degree, institution, graduationYear, specialties, photoUrl,
    id
  ]);
  
  revalidatePath('/staff');
  revalidatePath(`/staff/${id}`);
  redirect(`/staff/${id}`);
}

export async function deleteStaff(formData: FormData) {
  const id = formData.get('id') as string;
  await db.execute("DELETE FROM staff WHERE id = ?", [id]);
  revalidatePath('/staff');
}

export async function getStaffSummary() {
  const [totalRows] = await db.query("SELECT COUNT(*) as count FROM staff WHERE status = 'active'");
  const [rolesRows] = await db.query("SELECT role, COUNT(*) as count FROM staff WHERE status = 'active' GROUP BY role");
  return { 
    total: (totalRows as any[])[0].count, 
    roles: rolesRows as any[] 
  };
}

export async function savePayrollPayment(payrollData: any) {
  const { staffId, baseSalary, bonuses, deductions, netPay, periodStart, periodEnd } = payrollData;
  const paymentDate = new Date().toISOString().split('T')[0];
  
  await db.execute(`
    INSERT INTO staff_payroll (staffId, periodStart, periodEnd, baseSalary, bonuses, deductions, netPay, paymentDate, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid')
  `, [staffId, periodStart, periodEnd, baseSalary, bonuses, deductions, netPay, paymentDate]);
  
  revalidatePath('/staff');
}

export async function getCurrentPayrollStatus(periodStart: string, periodEnd: string) {
  const [rows] = await db.query(`
    SELECT staffId, status, bonuses, deductions, netPay 
    FROM staff_payroll 
    WHERE periodStart = ? AND periodEnd = ?
  `, [periodStart, periodEnd]);
  return rows as any[];
}

export async function getPayrollById(staffId: string, periodStart: string, periodEnd: string) {
  const [rows] = await db.query(`
     SELECT * FROM staff_payroll 
     WHERE staffId = ? AND periodStart = ? AND periodEnd = ?
     ORDER BY paymentDate DESC LIMIT 1
   `, [staffId, periodStart, periodEnd]);
  return (rows as any[])[0];
}
