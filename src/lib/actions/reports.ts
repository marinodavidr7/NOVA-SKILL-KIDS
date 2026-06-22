'use server';

import { db } from '@/lib/db';
import { getMonthlyFinancialSummary } from '@/lib/actions/finance';

export async function getReportsKPIs() {
  // 1. Niños activos
  const [activeChildrenRow] = await db.query("SELECT COUNT(*) as count FROM children WHERE status = 'active'");
  const activeChildren = (activeChildrenRow as any[])[0].count;

  // 2. Asistencia Hoy (%)
  const today = new Date().toISOString().split('T')[0];
  const [attendanceRow] = await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'present'", [today]);
  const attendanceToday = (attendanceRow as any[])[0].count;
  
  // Calculate percentage
  const attendancePercentage = activeChildren > 0 
    ? Math.round((attendanceToday / activeChildren) * 100) 
    : 0;

  // 3. Alertas Inventario (items below minStock)
  const [inventoryAlertsRow] = await db.query("SELECT COUNT(*) as count FROM inventory WHERE quantity <= minStock");
  const inventoryAlerts = (inventoryAlertsRow as any[])[0].count;

  // 4. Balance Mensual
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const financeSummary = await getMonthlyFinancialSummary(currentPeriod);
  const balanceMensual = financeSummary.netProfit;

  return {
    activeChildren,
    attendancePercentage,
    inventoryAlerts,
    balanceMensual
  };
}

/**
 * Get attendance report for a specific month (YYYY-MM)
 * Returns a list of children with their total present, absent, and late counts for that month.
 */
export async function getMonthlyAttendanceReport(period: string) {
  // We want to return all active children and their attendance counts for the month
  const [rows] = await db.query(`
    SELECT 
      c.id, 
      c.firstName, 
      c.lastName,
      c.photoUrl,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as presentCount,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absentCount,
      COUNT(CASE WHEN a.status = 'late' THEN 1 END) as lateCount
    FROM children c
    LEFT JOIN attendance a ON c.id = a.childId AND DATE_FORMAT(a.date, '%Y-%m') = ?
    WHERE c.status = 'active'
    GROUP BY c.id
    ORDER BY c.firstName, c.lastName
  `, [period]);
  return rows as any[];
}

export async function getEnrollmentReport() {
  const [rows] = await db.query(`
    SELECT c.*, cl.name as classroomName
    FROM children c
    LEFT JOIN classrooms cl ON c.classroomId = cl.id
    WHERE c.status = 'active'
    ORDER BY c.firstName
  `);
  return rows as any[];
}

export async function getPaymentsReport(period: string) {
  const [rows] = await db.query(`
    SELECT i.*, c.firstName, c.lastName
    FROM income i
    JOIN children c ON i.childId = c.id
    WHERE i.period = ? AND i.type = 'tuition'
    ORDER BY i.date DESC
  `, [period]);
  return rows as any[];
}

export async function getIncomeReport(period: string) {
  const [rows] = await db.query(`
    SELECT * FROM income
    WHERE DATE_FORMAT(date, '%Y-%m') = ?
    ORDER BY date DESC
  `, [period]);
  return rows as any[];
}

export async function getExpensesReport(period: string) {
  const [rows] = await db.query(`
    SELECT * FROM expenses
    WHERE DATE_FORMAT(date, '%Y-%m') = ?
    ORDER BY date DESC
  `, [period]);
  return rows as any[];
}

export async function getInventoryReport() {
  const [rows] = await db.query(`
    SELECT * FROM inventory
    ORDER BY category, name
  `);
  return rows as any[];
}

export async function getStaffReport() {
  const [rows] = await db.query(`
    SELECT * FROM staff
    WHERE status = 'active'
    ORDER BY role, firstName
  `);
  return rows as any[];
}

export async function getFinancialStateReport(period: string) {
  const [incomeRow] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM income WHERE DATE_FORMAT(date, '%Y-%m') = ?", [period]);
  const [expensesRow] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE DATE_FORMAT(date, '%Y-%m') = ?", [period]);
  return {
    totalIncome: (incomeRow as any[])[0].total,
    totalExpenses: (expensesRow as any[])[0].total,
    netProfit: (incomeRow as any[])[0].total - (expensesRow as any[])[0].total
  };
}

export async function getCashflowReport(period: string) {
  const [rows] = await db.query(`
    SELECT 'income' as source, id, date, description, amount, paymentMethod as details
    FROM income WHERE DATE_FORMAT(date, '%Y-%m') = ?
    UNION ALL
    SELECT 'expense' as source, id, date, description, -amount as amount, vendor as details
    FROM expenses WHERE DATE_FORMAT(date, '%Y-%m') = ?
    ORDER BY date ASC
  `, [period, period]);
  return rows as any[];
}
