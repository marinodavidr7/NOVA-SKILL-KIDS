'use server';

import { db } from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface SubscriptionPackage {
  id?: number;
  name: string;
  description?: string;
  min_age?: number;
  max_age?: number;
  duration_weeks?: number;
  start_date?: string | null;
  end_date?: string | null;
  schedule_days?: string;
  start_time?: string;
  end_time?: string;
  enrollment_fee?: number;
  periodic_fee?: number;
  periodic_frequency?: string;
  payment_day_spec?: string | null;
  total_fee?: number;
  payment_deadline?: number;
  discount_percentage?: number;
  capacity?: number | null;
}

export async function getPackages() {
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM subscription_packages');
  return rows;
}

export async function createPackage(data: SubscriptionPackage) {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO subscription_packages 
      (name, description, min_age, max_age, duration_weeks, start_date, end_date, schedule_days, start_time, end_time, enrollment_fee, periodic_fee, periodic_frequency, payment_day_spec, total_fee, payment_deadline, discount_percentage, capacity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name, data.description || null, data.min_age || null, data.max_age || null, 
      data.duration_weeks || null, data.start_date || null, data.end_date || null, 
      data.schedule_days || null, data.start_time || null, data.end_time || null, 
      data.enrollment_fee || 0, data.periodic_fee || 0, data.periodic_frequency || 'mensual', data.payment_day_spec || null,
      data.total_fee || 0, data.payment_deadline || null, data.discount_percentage || 0, data.capacity || null
    ]
  );
  return result.insertId;
}

export async function updatePackage(id: number, data: Partial<SubscriptionPackage>) {
  const keys = Object.keys(data).filter(k => k !== 'id');
  const values = keys.map(k => {
    const val = (data as any)[k];
    return val === '' ? null : val;
  });
  
  if (keys.length === 0) return false;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE subscription_packages SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return result.affectedRows > 0;
}

export async function deletePackage(id: number) {
  const [result] = await db.query<ResultSetHeader>(
    'DELETE FROM subscription_packages WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

export async function enrollChildInPackage(
  childId: number, 
  packageId: number, 
  options?: {
    customDiscount?: number,
    payEnrollmentNow?: boolean,
    payFirstPeriodicNow?: boolean,
    paymentMethod?: string
  }
) {
  const [pkgRows] = await db.query<RowDataPacket[]>('SELECT * FROM subscription_packages WHERE id = ?', [packageId]);
  if (pkgRows.length === 0) return { success: false, error: 'Package not found' };
  const pkg = pkgRows[0];

  if (pkg.capacity) {
    const [enrollments] = await db.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM child_subscriptions WHERE package_id = ?', [packageId]);
    if (enrollments[0].count >= pkg.capacity) {
      return { success: false, error: 'Capacidad máxima alcanzada para este paquete.' };
    }
  }

  const [activeSubs] = await db.query<RowDataPacket[]>(
    `SELECT sp.id, sp.name, sp.schedule_days, sp.start_time, sp.end_time 
     FROM child_subscriptions cs 
     JOIN subscription_packages sp ON cs.package_id = sp.id 
     WHERE cs.child_id = ?`,
    [childId]
  );

  if (activeSubs.some(sub => sub.id === packageId)) {
    return { success: false, error: `El alumno ya está inscrito en "${pkg.name}".` };
  }

  if (pkg.schedule_days && pkg.start_time && pkg.end_time) {
    const newDays = pkg.schedule_days.split(',').map((d: string) => d.trim());
    const newStart = pkg.start_time; 
    const newEnd = pkg.end_time; 

    for (const sub of activeSubs) {
      if (sub.schedule_days && sub.start_time && sub.end_time) {
        const subDays = sub.schedule_days.split(',').map((d: string) => d.trim());
        const hasCommonDay = newDays.some((d: string) => subDays.includes(d));
        if (hasCommonDay) {
          if (newStart < sub.end_time && sub.start_time < newEnd) {
            return { success: false, error: `Conflicto de horario con el programa "${sub.name}".` };
          }
        }
      }
    }
  }

  const [enrollResult] = await db.query<ResultSetHeader>(
    'INSERT INTO child_subscriptions (child_id, package_id) VALUES (?, ?)',
    [childId, packageId]
  );

  const discount = options?.customDiscount !== undefined ? options.customDiscount : (pkg.discount_percentage || 0);
  const payEnrollment = options?.payEnrollmentNow;
  const payFirstPeriodic = options?.payFirstPeriodicNow;
  const paymentMethod = options?.paymentMethod || 'Efectivo';
  
  // Calculate fees considering discount
  const enrollmentFee = pkg.enrollment_fee ? pkg.enrollment_fee * (1 - (discount / 100)) : 0;
  const periodicFee = pkg.periodic_fee ? pkg.periodic_fee * (1 - (discount / 100)) : 0;
  
  // Enrollment Fee Income
  if (enrollmentFee > 0) {
    const status = payEnrollment ? 'paid' : 'pending';
    const pMethod = payEnrollment ? paymentMethod : null;
    await db.query(
      `INSERT INTO income (type, amount, description, childId, date, status, dueDate, paymentMethod)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Inscripción', enrollmentFee, `Inscripción a paquete ${pkg.name}`, childId, new Date(), status, new Date(), pMethod]
    );
  }

  // Periodic Fees
  if (periodicFee > 0 && pkg.duration_weeks && pkg.periodic_frequency) {
    let installments = 0;
    let daysInterval = 0;
    
    if (pkg.periodic_frequency === 'semanal') {
      installments = pkg.duration_weeks;
      daysInterval = 7;
    } else if (pkg.periodic_frequency === 'quincenal') {
      installments = Math.ceil(pkg.duration_weeks / 2);
      daysInterval = 14;
    } else if (pkg.periodic_frequency === 'mensual') {
      installments = Math.ceil(pkg.duration_weeks / 4);
      daysInterval = 28; // approx
    } else if (pkg.periodic_frequency === 'unico') {
      installments = 1;
      daysInterval = 0;
    }

    const typeStr = pkg.periodic_frequency === 'semanal' ? 'Cuota Semanal' : 'Mensualidad';

    for (let i = 0; i < installments; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i * daysInterval));
      
      const isFirst = i === 0;
      const status = (isFirst && payFirstPeriodic) ? 'paid' : 'pending';
      const pMethod = (isFirst && payFirstPeriodic) ? paymentMethod : null;

      await db.query(
        `INSERT INTO income (type, amount, description, childId, date, status, dueDate, paymentMethod)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [typeStr, periodicFee, `Cuota ${i+1}/${installments} de paquete ${pkg.name}`, childId, new Date(), status, dueDate, pMethod]
      );
    }
  }

  return { success: true, insertId: enrollResult.insertId };
}

export async function getChildSubscriptions(childId: number) {
  const [rows] = await db.query(
    'SELECT cs.*, sp.name, sp.description, sp.total_fee FROM child_subscriptions cs JOIN subscription_packages sp ON cs.package_id = sp.id WHERE cs.child_id = ? ORDER BY cs.created_at DESC',
    [childId]
  );
  return rows as any[];
}

export async function getChildIncomes(childId: number) {
  const [rows] = await db.query(
    'SELECT * FROM income WHERE childId = ? ORDER BY dueDate ASC, date DESC',
    [childId]
  );
  return rows as any[];
}

export async function getPendingAcademicPayments() {
  const [rows] = await db.query(`
    SELECT i.*, c.firstName, c.lastName 
    FROM income i 
    JOIN children c ON i.childId = c.id
    WHERE i.status = 'pending' 
      AND (i.type = 'Inscripción' OR i.type = 'Cuota Semanal' OR i.type = 'Mensualidad')
    ORDER BY i.dueDate ASC, i.date DESC
  `);
  return rows as any[];
}

export async function markAcademicPaymentPaid(id: number, paymentMethod: string) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Get income details
    const [incomeRows] = await conn.query('SELECT * FROM income WHERE id = ?', [id]);
    const income = (incomeRows as any[])[0];
    
    if (!income) {
      throw new Error("Payment not found");
    }

    if (income.status === 'paid') {
      await conn.rollback();
      return true;
    }

    // 2. Mark as paid
    await conn.query(
      'UPDATE income SET status = ?, paymentMethod = ? WHERE id = ?',
      ['paid', paymentMethod, id]
    );

    // 3. Find primary account to deposit money based on payment method
    const accountType = paymentMethod === 'Efectivo' ? 'cash' : 'bank';
    const [accounts] = await conn.query('SELECT id FROM finance_accounts WHERE type = ? ORDER BY (name = "Caja Colegiaturas") DESC, id ASC LIMIT 1', [accountType]);
    let accountId = (accounts as any[])[0]?.id;
    
    if (!accountId) {
      const [fallbackAccounts] = await conn.query('SELECT id FROM finance_accounts ORDER BY id ASC LIMIT 1');
      accountId = (fallbackAccounts as any[])[0]?.id;
    }

    if (accountId) {
      // 4. Insert into finance_transactions
      await conn.query(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, category, relatedId)
        VALUES (?, 'in', ?, CURDATE(), CONCAT('Cobro Académico: ', ?), 'Ingresos Académicos', ?)
      `, [accountId, income.amount, income.type || 'Cuota', id]);

      // 5. Update account balance
      await conn.query('UPDATE finance_accounts SET balance = balance + ? WHERE id = ?', [income.amount, accountId]);
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    console.error("Error marking academic payment paid:", err);
    throw err;
  } finally {
    conn.release();
  }
}

export async function markMultipleAcademicPaymentsPaid(ids: number[], paymentMethod: string) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let totalAmount = 0;

    for (const id of ids) {
      const [incomeRows] = await conn.query('SELECT * FROM income WHERE id = ?', [id]);
      const income = (incomeRows as any[])[0];
      
      if (!income) throw new Error(`Payment ${id} not found`);
      
      if (income.status !== 'paid') {
        await conn.query(
          'UPDATE income SET status = ?, paymentMethod = ? WHERE id = ?',
          ['paid', paymentMethod, id]
        );
        totalAmount += parseFloat(income.amount);
      }
    }

    if (totalAmount > 0) {
      const accountType = paymentMethod === 'Efectivo' ? 'cash' : 'bank';
      const [accounts] = await conn.query('SELECT id FROM finance_accounts WHERE type = ? ORDER BY (name = "Caja Colegiaturas") DESC, id ASC LIMIT 1', [accountType]);
      let accountId = (accounts as any[])[0]?.id;
      
      if (!accountId) {
        const [fallbackAccounts] = await conn.query('SELECT id FROM finance_accounts ORDER BY id ASC LIMIT 1');
        accountId = (fallbackAccounts as any[])[0]?.id;
      }

      if (accountId) {
        await conn.query(`
          INSERT INTO finance_transactions (accountId, type, amount, date, description, category, relatedId)
          VALUES (?, 'in', ?, CURDATE(), ?, 'Ingresos Académicos', NULL)
        `, [accountId, totalAmount, `Cobro Académico Consolidado (${ids.length} cuotas)`]);

        await conn.query('UPDATE finance_accounts SET balance = balance + ? WHERE id = ?', [totalAmount, accountId]);
      }
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    console.error("Error marking multiple academic payments paid:", err);
    throw err;
  } finally {
    conn.release();
  }
}