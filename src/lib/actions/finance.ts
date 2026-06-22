'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Register a new income (e.g. tuition payment)
 */
export async function registerIncome(data: {
  childId: string | number;
  amount: number;
  description: string;
  paymentMethod: string;
  period: string;
}) {
  const { childId, amount, description, paymentMethod, period } = data;
  const date = new Date().toISOString().split('T')[0];

  const [result] = await db.execute(`
    INSERT INTO income (type, amount, description, childId, date, paymentMethod, period)
    VALUES ('tuition', ?, ?, ?, ?, ?, ?)
  `, [amount, description, childId, date, paymentMethod, period]);
  
  revalidatePath('/finance');
  return (result as any).insertId;
}

/**
 * Handle generic income creation from a form submission
 * Restored for compatibility with /finance/income/new/page.tsx
 */
export async function createIncome(formData: FormData) {
  const type = formData.get('type') as string;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const date = formData.get('date') as string;
  const paymentMethod = formData.get('paymentMethod') as string;
  const description = formData.get('description') as string;
  const reference = formData.get('reference') as string || null;
  const childIdRaw = formData.get('childId') as string;
  const childId = childIdRaw ? parseInt(childIdRaw, 10) : null;
  
  // Calculate period from date
  const period = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);

  await db.execute(`
    INSERT INTO income (type, amount, description, childId, date, paymentMethod, reference, period)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [type, amount, description, childId, date, paymentMethod, reference, period]);
  
  revalidatePath('/finance');
  redirect('/finance');
}

/**
 * Handle generic expense creation from a form submission
 * Restored for compatibility with /finance/expense/new/page.tsx
 */
export async function createExpense(formData: FormData) {
  const categoryRaw = formData.get('category') as string;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const date = formData.get('date') as string;
  const description = formData.get('description') as string;
  const vendor = formData.get('vendor') as string;
  const reference = formData.get('reference') as string || null;

  // Split category if it has " - "
  let category = categoryRaw;
  let subcategory = null;
  if (categoryRaw && categoryRaw.includes(' - ')) {
    const parts = categoryRaw.split(' - ');
    category = parts[0].trim();
    subcategory = parts[1].trim();
  }

  await db.execute(`
    INSERT INTO expenses (category, subcategory, amount, description, date, vendor, reference)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [category, subcategory, amount, description, date, vendor, reference]);
  
  revalidatePath('/finance');
  redirect('/finance');
}

/**
 * Get all active children and their payment status for a specific period
 */
export async function getTuitionStatusByPeriod(period: string) {
  // Get all active children
  const [children] = await db.query(`
    SELECT id, firstName, lastName, classroomId, photoUrl 
    FROM children 
    WHERE status = 'active'
    ORDER BY firstName, lastName
  `);

  // Get all tuition incomes for this period
  const [incomes] = await db.query(`
    SELECT * FROM income 
    WHERE type = 'tuition' AND period = ?
  `, [period]);

  // Map the status
  return (children as any[]).map(child => {
    const payment = (incomes as any[]).find(i => i.childId === child.id);
    return {
      ...child,
      fullName: `${child.firstName} ${child.lastName}`,
      isPaid: payment ? payment.status === 'paid' : false,
      paymentDetails: payment || null
    };
  });
}

/**
 * Get overall financial summary for the current month
 */
export async function getMonthlyFinancialSummary(period: string) {
  // Total collected this period
  const [totalIncomeObj] = await db.query(`
    SELECT SUM(amount) as total FROM income WHERE period = ?
  `, [period]);
  
  // Total paid to staff this period (assuming periodStart matches the month)
  // For simplicity, we just check staff_payroll where periodStart LIKE current month
  const monthPrefix = period; // e.g. "2023-10"
  
  const [totalPayrollObj] = await db.query(`
    SELECT SUM(netPay) as total FROM staff_payroll WHERE periodStart LIKE ?
  `, [`${monthPrefix}-%`]);

  return {
    totalIncome: (totalIncomeObj as any[])[0]?.total || 0,
    totalExpenses: (totalPayrollObj as any[])[0]?.total || 0,
    netProfit: ((totalIncomeObj as any[])[0]?.total || 0) - ((totalPayrollObj as any[])[0]?.total || 0)
  };
}

/**
 * Get a specific income receipt by ID
 */
export async function getIncomeReceipt(id: string) {
  const [rows] = await db.query(`
    SELECT 
      i.*, 
      c.firstName as childFirstName, 
      c.lastName as childLastName, 
      c.photoUrl,
      p.firstName as parentFirstName,
      p.lastName as parentLastName,
      p.phone as parentPhone,
      p.address as parentAddress
    FROM income i
    LEFT JOIN children c ON i.childId = c.id
    LEFT JOIN child_parents cp ON c.id = cp.child_id
    LEFT JOIN parents p ON cp.parent_id = p.id
    WHERE i.id = ?
    LIMIT 1
  `, [id]);
  return (rows as any[])[0] as any;
}
