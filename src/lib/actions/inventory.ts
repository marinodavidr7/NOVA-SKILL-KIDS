'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import path from 'path';

export async function getInventory() {
  const [rows] = await db.query("SELECT * FROM inventory WHERE status = 'active' ORDER BY category, name");
  return rows as any[];
}

export async function createInventoryItem(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const quantity = parseInt(formData.get('quantity') as string);
  const unit = formData.get('unit') as string;
  const minStock = parseInt(formData.get('minStock') as string);
  const location = formData.get('location') as string;
  const cost = parseFloat(formData.get('cost') as string) || 0;
  const accountId = formData.get('accountId') as string;
  let receiptUrl = undefined;
  
  const file = formData.get('receipt') as File;
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    
    try {
      await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }));
      await import('fs/promises').then(fs => fs.writeFile(path.join(uploadDir, filename), buffer));
      receiptUrl = `/uploads/receipts/${filename}`;
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  try {
    await db.query('BEGIN');
    
    const [info] = await db.execute(
      "INSERT INTO inventory (name, category, quantity, unit, minStock, location, lastPurchaseCost) VALUES (:name, :category, :quantity, :unit, :minStock, :location, :cost)",
      { name, category, quantity, unit, minStock, location, cost }
    ) as any[];
      
    // Record movement
    await db.execute(
      "INSERT INTO inventory_movements (inventoryId, type, quantity, notes, cost, accountId, receiptUrl) VALUES (:inventoryId, 'in', :quantity, 'Stock Inicial', :cost, :accountId, :receiptUrl)",
      { inventoryId: info.insertId, quantity, cost, accountId: accountId || null, receiptUrl: receiptUrl || null }
    );

    // If there is an associated cost and account, deduce money
    if (cost > 0 && accountId) {
      // 1. Register in expenses table so it shows up in "Gastos" module
      const [expenseInfo] = await db.execute(`
        INSERT INTO expenses (category, subcategory, amount, description, date, accountId, status, receiptUrl)
        VALUES ('Inventario', :category, :cost, CONCAT('Compra de Inventario Inicial: ', :name), CURDATE(), :accountId, 'paid', :receiptUrl)
      `, { category, cost, name, accountId, receiptUrl: receiptUrl || null }) as any[];

      // 2. Register in finance_transactions
      await db.execute(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, category, relatedId, receiptUrl)
        VALUES (:accountId, 'out', :cost, CURDATE(), CONCAT('Compra de Inventario Inicial: ', :name), 'Inventario', :relatedId, :receiptUrl)
      `, { accountId, cost, name, relatedId: expenseInfo.insertId, receiptUrl: receiptUrl || null });
      
      // 3. Update account balance
      await db.execute('UPDATE finance_accounts SET balance = balance - :cost WHERE id = :accountId', { cost, accountId });
      
      // 4. Sync with Petty Cash module if it's the Caja Chica account
      const [accountInfo] = await db.query('SELECT name FROM finance_accounts WHERE id = :accountId', { accountId }) as any[];
      if (accountInfo[0]?.name?.toUpperCase().includes('CAJA CHICA')) {
        const [pettyCashRows] = await db.query('SELECT id FROM petty_cash ORDER BY id ASC LIMIT 1') as any[];
        let pettyCashId;
        if (pettyCashRows.length === 0) {
          const [newPc] = await db.execute("INSERT INTO petty_cash (name, custodian, balance) VALUES ('Caja Chica Principal', 'Administración', 0)") as any[];
          pettyCashId = newPc.insertId;
        } else {
          pettyCashId = pettyCashRows[0].id;
        }
        
        await db.execute(`
          INSERT INTO petty_cash_transactions (pettyCashId, type, amount, description, receiptUrl, date)
          VALUES (:pettyCashId, 'expense', :cost, CONCAT('Compra Inventario: ', :name), :receiptUrl, CURDATE())
        `, { pettyCashId, cost, name, receiptUrl: receiptUrl || null });
        
        await db.execute('UPDATE petty_cash SET balance = balance - :cost WHERE id = :pettyCashId', { cost, pettyCashId });
      }
    }
    
    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    console.error(e);
  }
  
  revalidatePath('/inventory');
  revalidatePath('/finance');
  revalidatePath('/finance/accounts');
  revalidatePath('/finance/cashflow');
  redirect('/inventory');
}

export async function getInventoryItemById(id: string) {
  const [rows] = await db.query("SELECT * FROM inventory WHERE id = :id", { id });
  return (rows as any[])[0];
}

export async function getInventoryMovements(inventoryId?: string) {
  if (inventoryId) {
    const [rows] = await db.query(`
      SELECT m.*, a.name as accountName 
      FROM inventory_movements m
      LEFT JOIN finance_accounts a ON m.accountId = a.id
      WHERE m.inventoryId = :inventoryId 
      ORDER BY m.id DESC
    `, { inventoryId });
    return rows as any[];
  }
  const [rows] = await db.query(`
    SELECT m.*, i.name as itemName, a.name as accountName 
    FROM inventory_movements m
    JOIN inventory i ON m.inventoryId = i.id
    LEFT JOIN finance_accounts a ON m.accountId = a.id
    ORDER BY m.id DESC LIMIT 100
  `);
  return rows as any[];
}

export async function recordInventoryMovement(data: { inventoryId: string, type: 'in'|'out', quantity: number, notes: string, cost?: number, accountId?: string, receiptUrl?: string }) {
  const { inventoryId, type, quantity, notes, cost = 0, accountId, receiptUrl } = data;
  try {
    await db.query('BEGIN');
    
    // Insert movement
    await db.execute(
      "INSERT INTO inventory_movements (inventoryId, type, quantity, notes, cost, accountId, receiptUrl) VALUES (:inventoryId, :type, :quantity, :notes, :cost, :accountId, :receiptUrl)",
      { inventoryId, type, quantity, notes, cost, accountId: accountId || null, receiptUrl: receiptUrl || null }
    );

    // Update quantity
    if (type === 'in') {
      await db.execute(
        'UPDATE inventory SET quantity = quantity + :quantity, lastPurchaseCost = :cost WHERE id = :inventoryId',
        { quantity, cost, inventoryId }
      );
    } else {
      await db.execute(
        'UPDATE inventory SET quantity = quantity - :quantity WHERE id = :inventoryId',
        { quantity, inventoryId }
      );
    }

    // Finance integration
    if (type === 'in' && cost > 0 && accountId) {
      const [items] = await db.query('SELECT name, category FROM inventory WHERE id = :inventoryId', { inventoryId }) as any[];
      const item = items[0];
      
      // 1. Register in expenses table so it shows up in "Gastos" module
      const [expenseInfo] = await db.execute(`
        INSERT INTO expenses (category, subcategory, amount, description, date, accountId, receiptUrl, status)
        VALUES ('Inventario', :category, :cost, CONCAT('Compra de Inventario: ', :name), CURDATE(), :accountId, :receiptUrl, 'paid')
      `, { category: item.category, cost, name: item.name, accountId, receiptUrl: receiptUrl || null }) as any[];

      // 2. Register in finance_transactions
      await db.execute(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, category, relatedId, receiptUrl)
        VALUES (:accountId, 'out', :cost, CURDATE(), CONCAT('Compra de Inventario: ', :name), 'Inventario', :relatedId, :receiptUrl)
      `, { accountId, cost, name: item.name, relatedId: expenseInfo.insertId, receiptUrl: receiptUrl || null });
      
      // 3. Update account balance
      await db.execute('UPDATE finance_accounts SET balance = balance - :cost WHERE id = :accountId', { cost, accountId });
      
      // 4. Sync with Petty Cash module if it's the Caja Chica account
      const [accountInfo] = await db.query('SELECT name FROM finance_accounts WHERE id = :accountId', { accountId }) as any[];
      if (accountInfo[0]?.name?.toUpperCase().includes('CAJA CHICA')) {
        const [pettyCashRows] = await db.query('SELECT id FROM petty_cash ORDER BY id ASC LIMIT 1') as any[];
        let pettyCashId;
        if (pettyCashRows.length === 0) {
          const [newPc] = await db.execute("INSERT INTO petty_cash (name, custodian, balance) VALUES ('Caja Chica Principal', 'Administración', 0)") as any[];
          pettyCashId = newPc.insertId;
        } else {
          pettyCashId = pettyCashRows[0].id;
        }
        
        await db.execute(`
          INSERT INTO petty_cash_transactions (pettyCashId, type, amount, description, receiptUrl, date)
          VALUES (:pettyCashId, 'expense', :cost, CONCAT('Compra Inventario: ', :name), :receiptUrl, CURDATE())
        `, { pettyCashId, cost, name: item.name, receiptUrl: receiptUrl || null });
        
        await db.execute('UPDATE petty_cash SET balance = balance - :cost WHERE id = :pettyCashId', { cost, pettyCashId });
      }
    }

    await db.query('COMMIT');
    revalidatePath('/inventory');
    if (cost > 0) revalidatePath('/finance');
    return { success: true };
  } catch (e: any) {
    await db.query('ROLLBACK');
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function updateInventoryItem(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const unit = formData.get('unit') as string;
  const minStock = parseInt(formData.get('minStock') as string);
  const location = formData.get('location') as string;
  
  let receiptUrl = undefined;
  const file = formData.get('receipt') as File;
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    
    try {
      await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }));
      await import('fs/promises').then(fs => fs.writeFile(path.join(uploadDir, filename), buffer));
      receiptUrl = `/uploads/receipts/${filename}`;
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  if (receiptUrl) {
    await db.execute(
      "UPDATE inventory SET name = :name, category = :category, unit = :unit, minStock = :minStock, location = :location, receiptUrl = :receiptUrl WHERE id = :id",
      { name, category, unit, minStock, location, receiptUrl, id }
    );
      
    try {
      await db.execute(
        "UPDATE expenses SET receiptUrl = :receiptUrl WHERE category = 'Inventario' AND description LIKE CONCAT('%', :name, '%') AND receiptUrl IS NULL",
        { receiptUrl, name }
      );
    } catch(e) {}
  } else {
    await db.execute(
      "UPDATE inventory SET name = :name, category = :category, unit = :unit, minStock = :minStock, location = :location WHERE id = :id",
      { name, category, unit, minStock, location, id }
    );
  }

  revalidatePath('/inventory');
  redirect(`/inventory/items/${id}`);
}

export async function deleteInventoryItem(formData: FormData) {
  const id = formData.get('id') as string;
  const [rows] = await db.query('SELECT COUNT(*) as count FROM inventory_movements WHERE inventoryId = :id', { id }) as any[];
  const hasMovements = rows[0];
  
  if (hasMovements.count > 0) {
    await db.execute("UPDATE inventory SET status = 'deleted' WHERE id = :id", { id });
  } else {
    await db.execute("DELETE FROM inventory WHERE id = :id", { id });
  }
  revalidatePath('/inventory');
  redirect('/inventory');
}

export async function getAssets() {
  const [rows] = await db.query("SELECT * FROM assets ORDER BY category, name");
  return rows as any[];
}

export async function createAsset(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const purchaseDate = formData.get('purchaseDate') as string;
  const purchaseValue = parseFloat(formData.get('purchaseValue') as string);
  const status = (formData.get('status') as string) || 'active';
  const location = formData.get('location') as string;
  const serialNumber = formData.get('serialNumber') as string;
  const accountId = formData.get('accountId') as string;

  try {
    await db.query('BEGIN');

    const [info] = await db.execute(
      "INSERT INTO assets (name, category, purchaseDate, purchaseValue, status, location, serialNumber) VALUES (:name, :category, :purchaseDate, :purchaseValue, :status, :location, :serialNumber)",
      { name, category, purchaseDate, purchaseValue, status, location, serialNumber }
    ) as any[];

    // If there is an associated cost and account, deduce money
    if (purchaseValue > 0 && accountId) {
      await db.execute(`
        INSERT INTO finance_transactions (accountId, type, amount, date, description, category, relatedId)
        VALUES (:accountId, 'out', :purchaseValue, :purchaseDate, CONCAT('Compra de Activo Fijo: ', :name), 'Activos', :relatedId)
      `, { accountId, purchaseValue, purchaseDate, name, relatedId: info.insertId });
      
      await db.execute('UPDATE finance_accounts SET balance = balance - :purchaseValue WHERE id = :accountId', { purchaseValue, accountId });
    }
    
    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    console.error(e);
  }

  revalidatePath('/inventory');
  revalidatePath('/finance');
  revalidatePath('/finance/accounts');
  revalidatePath('/finance/cashflow');
  redirect('/inventory');
}

export async function getInventorySummary() {
  const [totalItemsRows] = await db.query("SELECT COUNT(*) as count FROM inventory") as any[];
  const [lowStockRows] = await db.query("SELECT COUNT(*) as count FROM inventory WHERE quantity <= minStock") as any[];
  const [totalAssetsRows] = await db.query("SELECT COUNT(*) as count FROM assets") as any[];
  const [assetsValueRows] = await db.query("SELECT COALESCE(SUM(purchaseValue),0) as total FROM assets") as any[];
  
  return { 
    totalItems: totalItemsRows[0].count, 
    lowStock: lowStockRows[0].count, 
    totalAssets: totalAssetsRows[0].count, 
    assetsValue: assetsValueRows[0].total 
  };
}
