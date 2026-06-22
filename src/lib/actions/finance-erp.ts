"use server";

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

// ==========================================
// 1. ACCOUNTS (Caja y Bancos)
// ==========================================

export async function getAccounts() {
  try {
    const [rows] = await db.query('SELECT * FROM finance_accounts ORDER BY type DESC, name ASC');
    return rows as any[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function createAccount(data: { name: string; type: string; currency: string; accountNumber?: string; bankName?: string; balance?: number }) {
  try {
    const [result] = await db.execute(`
      INSERT INTO finance_accounts (name, type, currency, accountNumber, bankName, balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      data.name,
      data.type,
      data.currency || 'DOP',
      data.accountNumber || null,
      data.bankName || null,
      data.balance || 0
    ]);
    revalidatePath('/finance');
    revalidatePath('/finance/accounts');
    return { success: true, id: (result as any).insertId };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getAccountTransactions(accountId: number) {
  try {
    const [rows] = await db.query('SELECT * FROM finance_transactions WHERE accountId = ? ORDER BY date DESC, id DESC', [accountId]);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function recordTransaction(data: { accountId: number; type: 'in' | 'out' | 'transfer'; amount: number; date: string; description: string; reference?: string; category?: string; targetAccountId?: number }) {
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    try {
      // Insert main transaction
      await conn.execute(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, reference, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        data.accountId,
        data.type,
        data.amount,
        data.date,
        data.description,
        data.reference || null,
        data.category || null
      ]);

      // Update balance
      if (data.type === 'in') {
        await conn.execute('UPDATE finance_accounts SET balance = balance + ? WHERE id = ?', [data.amount, data.accountId]);
      } else if (data.type === 'out') {
        await conn.execute('UPDATE finance_accounts SET balance = balance - ? WHERE id = ?', [data.amount, data.accountId]);
      } else if (data.type === 'transfer' && data.targetAccountId) {
        // It's a transfer, deduct from source and add to target
        await conn.execute('UPDATE finance_accounts SET balance = balance - ? WHERE id = ?', [data.amount, data.accountId]);
        
        // Create inverse transaction for target account
        await conn.execute(`
          INSERT INTO finance_transactions (accountId, type, amount, date, description, reference, category)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          data.targetAccountId,
          'in',
          data.amount,
          data.date,
          `Transferencia desde ${data.description}`,
          data.reference || null,
          'Transferencia'
        ]);
        await conn.execute('UPDATE finance_accounts SET balance = balance + ? WHERE id = ?', [data.amount, data.targetAccountId]);
      }

      await conn.commit();
      conn.release();

      revalidatePath('/finance');
      revalidatePath('/finance/accounts');
      return { success: true };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

// ==========================================
// 2. INCOME (Ingresos y Mensualidades)
// ==========================================

export async function getIncomeRecords() {
  try {
    const [rows] = await db.query(`
      SELECT i.*, 
             a.name as accountName, 
             c.firstName, c.lastName 
      FROM income i
      LEFT JOIN finance_accounts a ON i.accountId = a.id
      LEFT JOIN children c ON i.childId = c.id
      ORDER BY i.date DESC, i.id DESC
    `);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function generateMonthlyTuitions(period: string, amount: number) {
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    try {
      // Get all active children
      const [children] = await conn.query("SELECT id FROM children WHERE status = 'active'");
      
      let count = 0;
      for (const child of children as any[]) {
        // Check if it already exists
        const [existing] = await conn.query('SELECT 1 FROM income WHERE childId = ? AND period = ? AND type = ?', [child.id, period, 'tuition']);
        if (!(existing as any[]).length) {
          // INSERT INTO income...
          await conn.execute(`
            INSERT INTO income (type, amount, description, childId, date, status, period, dueDate)
            VALUES ('tuition', ?, CONCAT('Mensualidad - ', ?), ?, CURDATE(), 'pending', ?, DATE_ADD(CURDATE(), INTERVAL 5 DAY))
          `, [amount, period, child.id, period]);
          count++;
        }
      }

      await conn.commit();
      conn.release();

      revalidatePath('/finance/income');
      revalidatePath('/finance');
      return { success: true, count };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function payIncome(id: number, accountId: number, method: string, reference?: string) {
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    try {
      const [incomeRows] = await conn.query('SELECT amount, status FROM income WHERE id = ?', [id]);
      const income = (incomeRows as any[])[0];
      if (!income || income.status === 'paid') throw new Error('Ingreso no válido o ya pagado');

      // Update income
      await conn.execute(`
        UPDATE income 
        SET status = 'paid', accountId = ?, paymentMethod = ?, reference = ?, date = CURDATE()
        WHERE id = ?
      `, [accountId, method, reference || null, id]);

      // Create transaction in account
      await conn.execute(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, reference, category, relatedId)
        VALUES (?, 'in', ?, CURDATE(), CONCAT('Cobro de Ingreso #', ?), ?, 'Ingreso', ?)
      `, [accountId, income.amount, id, reference || null, id]);

      // Update account balance
      await conn.execute('UPDATE finance_accounts SET balance = balance + ? WHERE id = ?', [income.amount, accountId]);

      await conn.commit();
      conn.release();

      revalidatePath('/finance/income');
      revalidatePath('/finance/accounts');
      revalidatePath('/finance/receivables');
      return { success: true };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function payTuition(data: { childId: number | string; amount: number; period: string; method: string; accountId: number }) {
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    try {
      // Check if pending income exists
      const [incomeRows] = await conn.query("SELECT id FROM income WHERE childId = ? AND period = ? AND type = 'tuition' AND status = 'pending'", [data.childId, data.period]);
      const income = (incomeRows as any[])[0];
      
      let incomeId;
      if (income) {
        incomeId = income.id;
        await conn.execute(`
          UPDATE income 
          SET status = 'paid', amount = ?, accountId = ?, paymentMethod = ?, date = CURDATE()
          WHERE id = ?
        `, [data.amount, data.accountId, data.method, incomeId]);
      } else {
        const [result] = await conn.execute(`
          INSERT INTO income (type, amount, description, childId, date, status, period, paymentMethod, accountId)
          VALUES ('tuition', ?, CONCAT('Mensualidad - ', ?), ?, CURDATE(), 'paid', ?, ?, ?)
        `, [data.amount, data.period, data.childId, data.period, data.method, data.accountId]);
        incomeId = (result as any).insertId;
      }

      // Create transaction
      await conn.execute(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, category, relatedId)
        VALUES (?, 'in', ?, CURDATE(), 'Cobro de Colegiatura', 'Ingreso', ?)
      `, [data.accountId, data.amount, incomeId]);

      // Update account balance
      await conn.execute('UPDATE finance_accounts SET balance = balance + ? WHERE id = ?', [data.amount, data.accountId]);

      await conn.commit();
      conn.release();

      revalidatePath('/finance');
      revalidatePath('/finance/income');
      revalidatePath('/finance/accounts');
      return { success: true };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

// ==========================================
// 3. RECEIVABLES (Cuentas por Cobrar / Morosidad)
// ==========================================

export async function getReceivables() {
  try {
    const [rows] = await db.query(`
      SELECT i.*, 
             c.firstName, c.lastName, c.id as childId,
             p.phone as parentPhone
      FROM income i
      LEFT JOIN children c ON i.childId = c.id
      LEFT JOIN child_parents cp ON c.id = cp.child_id AND cp.isEmergencyContact = 1
      LEFT JOIN parents p ON cp.parent_id = p.id
      WHERE i.status = 'pending'
      ORDER BY i.dueDate ASC
    `);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

// ==========================================
// 4. LOANS (Préstamos y Deudas)
// ==========================================

export async function getLoans() {
  try {
    const [rows] = await db.query('SELECT * FROM loans ORDER BY status ASC, id DESC');
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function getLoanPayments(loanId: number) {
  try {
    const [rows] = await db.query('SELECT * FROM loan_payments WHERE loanId = ? ORDER BY date DESC', [loanId]);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function getAllLoanPayments() {
  try {
    const [rows] = await db.query(`
      SELECT p.*, a.name as accountName 
      FROM loan_payments p
      LEFT JOIN finance_accounts a ON p.accountId = a.id
      ORDER BY p.date DESC
    `);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function createLoan(data: { lender: string; amount: number; interestRate: number; startDate: string; endDate: string; notes?: string; accountId: number }) {
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    try {
      const [result] = await conn.execute(`
        INSERT INTO loans (lender, amount, interestRate, startDate, endDate, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        data.lender,
        data.amount,
        data.interestRate || 0,
        data.startDate,
        data.endDate,
        data.notes || null
      ]);

      const loanId = (result as any).insertId;

      // Register incoming funds into account
      await conn.execute(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, category, relatedId)
        VALUES (?, 'in', ?, ?, CONCAT('Ingreso por Préstamo de ', ?), 'Préstamos', ?)
      `, [data.accountId, data.amount, data.startDate, data.lender, loanId]);

      // Update account balance
      await conn.execute('UPDATE finance_accounts SET balance = balance + ? WHERE id = ?', [data.amount, data.accountId]);

      await conn.commit();
      conn.release();

      revalidatePath('/finance');
      revalidatePath('/finance/loans');
      revalidatePath('/finance/accounts');
      return { success: true, id: loanId };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function registerLoanPayment(data: { loanId: number; accountId: number; amount: number; principal: number; interest: number; date: string; reference?: string }) {
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();
    
    try {
      // 1. Insert Payment
      await conn.execute(`
        INSERT INTO loan_payments (loanId, accountId, amount, principal, interest, date, reference)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        data.loanId,
        data.accountId,
        data.amount,
        data.principal,
        data.interest,
        data.date,
        data.reference || null
      ]);

      // 2. Insert Transaction
      const [loanRows] = await conn.query('SELECT lender FROM loans WHERE id = ?', [data.loanId]);
      const loan = (loanRows as any[])[0];

      await conn.execute(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, reference, category, relatedId)
        VALUES (?, 'out', ?, ?, CONCAT('Pago de Préstamo a ', ?), ?, 'Préstamos', ?)
      `, [
        data.accountId, 
        data.amount, 
        data.date, 
        loan?.lender || 'Prestamista', 
        data.reference || null, 
        data.loanId
      ]);

      // 3. Update Balance
      await conn.execute('UPDATE finance_accounts SET balance = balance - ? WHERE id = ?', [data.amount, data.accountId]);

      // 4. Check if loan is fully paid
      const [principalRows] = await conn.query('SELECT SUM(principal) as sum FROM loan_payments WHERE loanId = ?', [data.loanId]);
      const totalPrincipal = (principalRows as any[])[0];
      
      const [loanDataRows] = await conn.query('SELECT amount FROM loans WHERE id = ?', [data.loanId]);
      const loanData = (loanDataRows as any[])[0];
      
      if (totalPrincipal && loanData && totalPrincipal.sum >= loanData.amount) {
        await conn.execute("UPDATE loans SET status = 'paid' WHERE id = ?", [data.loanId]);
      }

      await conn.commit();
      conn.release();

      revalidatePath('/finance/loans');
      revalidatePath('/finance/accounts');
      return { success: true };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
// ==========================================
// 5. EXPENSES (Gastos)
// ==========================================

export async function getExpenses() {
  try {
    const [rows] = await db.query(`
      SELECT e.*, a.name as accountName 
      FROM expenses e
      LEFT JOIN finance_accounts a ON e.accountId = a.id
      ORDER BY e.date DESC, e.id DESC
    `);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function createExpense(data: { category: string; subcategory?: string; amount: number; description: string; date: string; vendor?: string; accountId: number; receiptUrl?: string; dueDate?: string; status?: string }) {
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const status = data.status || 'paid';
      
      // Insert expense
      const [result] = await conn.execute(`
        INSERT INTO expenses (category, subcategory, amount, description, date, vendor, accountId, receiptUrl, dueDate, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.category,
        data.subcategory || null,
        data.amount,
        data.description,
        data.date,
        data.vendor || null,
        data.accountId,
        data.receiptUrl || null,
        data.dueDate || null,
        status
      ]);
      const expenseId = (result as any).insertId;

      // If paid immediately, create transaction and reduce balance
      if (status === 'paid') {
        await conn.execute(`
          INSERT INTO finance_transactions (accountId, type, amount, date, description, category, relatedId)
          VALUES (?, 'out', ?, ?, ?, ?, ?)
        `, [data.accountId, data.amount, data.date, data.description, data.category, expenseId]);
        
        await conn.execute('UPDATE finance_accounts SET balance = balance - ? WHERE id = ?', [data.amount, data.accountId]);
      }

      await conn.commit();
      conn.release();

      revalidatePath('/finance/expenses');
      revalidatePath('/finance/accounts');
      return { success: true, id: expenseId };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function registerExpense(formData: FormData) {
  'use server';
  
  let receiptUrl = undefined;
  const file = formData.get('receipt') as File;
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      receiptUrl = `/uploads/receipts/${filename}`;
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  return createExpense({
    category: formData.get('category') as string,
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description') as string,
    date: formData.get('date') as string,
    vendor: formData.get('vendor') as string || undefined,
    accountId: parseInt(formData.get('accountId') as string, 10),
    receiptUrl
  });
}

export async function attachExpenseReceipt(expenseId: number, formData: FormData) {
  'use server';
  const file = formData.get('receipt') as File;
  if (!file || file.size === 0) return { success: false };

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
  
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    const receiptUrl = `/uploads/receipts/${filename}`;
    
    await db.execute('UPDATE expenses SET receiptUrl = ? WHERE id = ?', [receiptUrl, expenseId]);
    await db.execute('UPDATE finance_transactions SET receiptUrl = ? WHERE category IN ("Inventario", "Gastos") AND relatedId = ?', [receiptUrl, expenseId]);
    
    revalidatePath('/finance/expenses');
    return { success: true };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false };
  }
}

// ==========================================
// 6. PETTY CASH (Caja Chica)
// ==========================================

export async function getPettyCash() {
  try {
    const [rows] = await db.query('SELECT * FROM petty_cash ORDER BY id ASC');
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function getPettyCashTransactions(pettyCashId: number) {
  try {
    const [rows] = await db.query('SELECT * FROM petty_cash_transactions WHERE pettyCashId = ? ORDER BY date DESC, id DESC', [pettyCashId]);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function recordPettyCashTransaction(data: { pettyCashId: number; type: 'replenish' | 'expense'; amount: number; description: string; receiptUrl?: string; date: string }) {
  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      // 1. Insert Transaction
      await conn.execute(`
        INSERT INTO petty_cash_transactions (pettyCashId, type, amount, description, receiptUrl, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        data.pettyCashId,
        data.type,
        data.amount,
        data.description,
        data.receiptUrl || null,
        data.date
      ]);

      // 2. Update Balance
      if (data.type === 'replenish') {
        await conn.execute('UPDATE petty_cash SET balance = balance + ? WHERE id = ?', [data.amount, data.pettyCashId]);
      } else {
        await conn.execute('UPDATE petty_cash SET balance = balance - ? WHERE id = ?', [data.amount, data.pettyCashId]);
      }

      await conn.commit();
      conn.release();

      revalidatePath('/finance/petty-cash');
      return { success: true };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      throw e;
    }
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

// ==========================================
// 7. BUDGETS (Presupuestos)
// ==========================================

export async function getBudgets(period: string) {
  try {
    const [rows] = await db.query('SELECT * FROM budgets WHERE period = ? ORDER BY category ASC', [period]);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function createBudget(data: { category: string; period: string; estimatedAmount: number; notes?: string }) {
  try {
    // ON DUPLICATE KEY UPDATE for MySQL instead of ON CONFLICT
    const [result] = await db.execute(`
      INSERT INTO budgets (category, period, estimatedAmount, notes)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        estimatedAmount = VALUES(estimatedAmount),
        notes = VALUES(notes)
    `, [
      data.category,
      data.period,
      data.estimatedAmount,
      data.notes || null
    ]);
    revalidatePath('/finance/budgets');
    return { success: true, id: (result as any).insertId };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function deleteBudget(id: number) {
  try {
    await db.execute('DELETE FROM budgets WHERE id = ?', [id]);
    revalidatePath('/finance/budgets');
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

// ==========================================
// 8. CASHFLOW & REPORTS (Flujo de Caja y Reportes)
// ==========================================

export async function getCashflow(startDate: string, endDate: string) {
  try {
    const [rows] = await db.query(`
      SELECT t.*, a.name as accountName
      FROM finance_transactions t
      LEFT JOIN finance_accounts a ON t.accountId = a.id
      WHERE date >= ? AND date <= ?
      ORDER BY date DESC, t.id DESC
    `, [startDate, endDate]);
    return JSON.parse(JSON.stringify(rows)) as any[];
  } catch (e) {
    return [];
  }
}

export async function getIncomeStatement(startDate: string, endDate: string) {
  try {
    const [incomes] = await db.query("SELECT category, SUM(amount) as total FROM finance_transactions WHERE type = 'in' AND date >= ? AND date <= ? GROUP BY category", [startDate, endDate]);
    const [expenses] = await db.query("SELECT category, SUM(amount) as total FROM finance_transactions WHERE type = 'out' AND date >= ? AND date <= ? GROUP BY category", [startDate, endDate]);
    
    return { incomes: incomes as any[], expenses: expenses as any[] };
  } catch (e) {
    return { incomes: [], expenses: [] };
  }
}

// ==========================================
// DASHBOARD QUERIES
// ==========================================

export async function getRecentTransactions(limit = 5) {
  try {
    const [rows] = await db.query(`
      SELECT t.*, a.name as accountName 
      FROM finance_transactions t
      LEFT JOIN finance_accounts a ON t.accountId = a.id
      ORDER BY t.date DESC, t.id DESC
      LIMIT ?
    `, [limit]);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function getExpensesByCategory(period: string) {
  try {
    const [rows] = await db.query(`
      SELECT category, SUM(amount) as total
      FROM expenses
      WHERE date LIKE ?
      GROUP BY category
      ORDER BY total DESC
    `, [`${period}%`]);
    return rows as any[];
  } catch (e) {
    return [];
  }
}

export async function updateAccount(id: number, data: { name: string; accountNumber?: string; bankName?: string; currency: string }) {
  try {
    await db.execute(`
      UPDATE finance_accounts 
      SET 
        name = ?, 
        accountNumber = ?, 
        bankName = ?, 
        currency = ?
      WHERE id = ?
    `, [data.name, data.accountNumber || null, data.bankName || null, data.currency, id]);

    revalidatePath('/finance');
    revalidatePath('/finance/accounts');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(id: number) {
  try {
    // Check if there are any transactions associated with this account
    const [transRows] = await db.query('SELECT 1 FROM finance_transactions WHERE accountId = ? LIMIT 1', [id]);
    const hasTransactions = (transRows as any[])[0];
    if (hasTransactions) {
      return { success: false, error: 'No se puede eliminar la cuenta porque tiene transacciones registradas. Primero debes conciliar o eliminar las transacciones asociadas para mantener la integridad contable.' };
    }

    // Check if there are any incomes associated with this account
    const [incRows] = await db.query('SELECT 1 FROM income WHERE accountId = ? LIMIT 1', [id]);
    const hasIncomes = (incRows as any[])[0];
    if (hasIncomes) {
      return { success: false, error: 'No se puede eliminar la cuenta porque tiene ingresos registrados asociados.' };
    }

    // Check if there are any expenses associated with this account
    const [expRows] = await db.query('SELECT 1 FROM expenses WHERE accountId = ? LIMIT 1', [id]);
    const hasExpenses = (expRows as any[])[0];
    if (hasExpenses) {
      return { success: false, error: 'No se puede eliminar la cuenta porque tiene gastos registrados asociados.' };
    }

    await db.execute('DELETE FROM finance_accounts WHERE id = ?', [id]);

    revalidatePath('/finance');
    revalidatePath('/finance/accounts');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
