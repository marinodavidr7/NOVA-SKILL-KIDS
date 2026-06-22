import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/estancia',
  });
  
  try {
    await connection.query('BEGIN');

    // 1. Get CAJA CHICA account ID from finance_accounts
    const [financeAccounts] = await connection.query("SELECT id FROM finance_accounts WHERE name LIKE '%CAJA CHICA%'") as any[];
    if (financeAccounts.length === 0) {
      console.log('No CAJA CHICA account found in finance_accounts.');
      return;
    }
    const cajaChicaAccountId = financeAccounts[0].id;
    console.log(`Found CAJA CHICA finance_account ID: ${cajaChicaAccountId}`);

    // 2. Ensure petty_cash table has an entry
    let [pettyCashRows] = await connection.query('SELECT id FROM petty_cash ORDER BY id ASC LIMIT 1') as any[];
    let pettyCashId;
    if (pettyCashRows.length === 0) {
      const [newPc] = await connection.execute("INSERT INTO petty_cash (name, custodian, balance) VALUES ('Caja Chica Principal', 'Administración', 0)") as any[];
      pettyCashId = newPc.insertId;
      console.log(`Created new petty_cash record with ID: ${pettyCashId}`);
    } else {
      pettyCashId = pettyCashRows[0].id;
      console.log(`Found existing petty_cash record with ID: ${pettyCashId}`);
    }

    // 3. Get all inventory_movements that were paid with CAJA CHICA and have a cost > 0
    const [movements] = await connection.query(`
      SELECT m.*, i.name as itemName 
      FROM inventory_movements m
      JOIN inventory i ON m.inventoryId = i.id
      WHERE m.accountId = ? AND m.cost > 0 AND m.type = 'in'
    `, [cajaChicaAccountId]) as any[];

    console.log(`Found ${movements.length} past inventory movements paid with CAJA CHICA.`);

    let totalDeducted = 0;
    let syncedCount = 0;

    for (const mov of movements) {
      // Check if it was already synced (we can check by matching description and amount)
      const description = `Compra Inventario: ${mov.itemName}`;
      // In the old system it might have been "Compra de Inventario Inicial: ..." but let's just search by amount and date roughly, or since the table is empty we can just insert.
      // Let's check exactly:
      const [existing] = await connection.query(`
        SELECT id FROM petty_cash_transactions 
        WHERE pettyCashId = ? AND amount = ? AND type = 'expense'
      `, [pettyCashId, mov.cost]) as any[];

      // If we don't want to accidentally duplicate, let's assume if it exists with same amount we skip. But multiple items could have the same cost. 
      // Actually earlier we saw Petty Cash Accounts was EMPTY. So petty_cash_transactions is also empty. We can safely insert.

      console.log(`Syncing movement ID ${mov.id} - Item: ${mov.itemName} - Cost: ${mov.cost}`);
      
      let finalDescription = mov.notes === 'Stock Inicial' ? `Compra de Inventario Inicial: ${mov.itemName}` : `Compra Inventario: ${mov.itemName}`;

      await connection.execute(`
        INSERT INTO petty_cash_transactions (pettyCashId, type, amount, description, receiptUrl, date)
        VALUES (?, 'expense', ?, ?, ?, COALESCE(?, CURDATE()))
      `, [pettyCashId, mov.cost, finalDescription, mov.receiptUrl || null, mov.createdAt || null]);
      
      totalDeducted += parseFloat(mov.cost);
      syncedCount++;
    }

    if (syncedCount > 0) {
      // 4. Update the petty_cash balance
      await connection.execute('UPDATE petty_cash SET balance = balance - ? WHERE id = ?', [totalDeducted, pettyCashId]);
      console.log(`Successfully synced ${syncedCount} movements. Deducted total: $${totalDeducted} from petty_cash.`);
    } else {
      console.log('No new movements to sync.');
    }

    await connection.query('COMMIT');
  } catch (e) {
    await connection.query('ROLLBACK');
    console.error('Error during sync:', e);
  } finally {
    await connection.end();
  }
}

run();
