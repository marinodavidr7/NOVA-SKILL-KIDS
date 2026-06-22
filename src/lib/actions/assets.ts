'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getAssets() {
  const [rows] = await db.query("SELECT * FROM assets ORDER BY purchaseDate DESC");
  return JSON.parse(JSON.stringify(rows)) as any[];
}

export async function getAssetById(id: number) {
  const [rows] = await db.query("SELECT * FROM assets WHERE id = :id", { id });
  const asset = (rows as any[])[0];
  
  if (!asset) return null;

  const [maintenanceHistory] = await db.query("SELECT * FROM asset_maintenance WHERE assetId = :id ORDER BY date DESC", { id });

  return JSON.parse(JSON.stringify({ ...asset, maintenanceHistory: maintenanceHistory as any[] }));
}

export async function createAsset(formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const purchaseDate = formData.get('purchaseDate') as string;
  const purchaseValue = parseFloat(formData.get('purchaseValue') as string);
  const status = formData.get('status') as string;
  const location = formData.get('location') as string;
  const serialNumber = formData.get('serialNumber') as string;
  const notes = formData.get('notes') as string;

  await db.execute(`
    INSERT INTO assets (name, category, purchaseDate, purchaseValue, status, location, serialNumber, notes)
    VALUES (:name, :category, :purchaseDate, :purchaseValue, :status, :location, :serialNumber, :notes)
  `, { name, category, purchaseDate, purchaseValue, status, location, serialNumber, notes });

  revalidatePath('/assets');
  redirect('/assets');
}

export async function addMaintenanceRecord(assetId: number, formData: FormData) {
  const date = formData.get('date') as string;
  const description = formData.get('description') as string;
  const cost = parseFloat(formData.get('cost') as string) || 0;
  const technician = formData.get('technician') as string;
  const nextMaintenanceDate = formData.get('nextMaintenanceDate') as string;

  await db.execute(`
    INSERT INTO asset_maintenance (assetId, date, description, cost, technician, nextMaintenanceDate)
    VALUES (:assetId, :date, :description, :cost, :technician, :nextMaintenanceDate)
  `, { assetId, date, description, cost, technician, nextMaintenanceDate: nextMaintenanceDate || null });

  revalidatePath(`/assets/${assetId}`);
}

export async function updateAsset(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const purchaseDate = formData.get('purchaseDate') as string;
  const purchaseValue = parseFloat(formData.get('purchaseValue') as string);
  const status = formData.get('status') as string;
  const location = formData.get('location') as string;
  const serialNumber = formData.get('serialNumber') as string;
  const notes = formData.get('notes') as string;

  await db.execute(`
    UPDATE assets 
    SET name = :name, category = :category, purchaseDate = :purchaseDate, 
        purchaseValue = :purchaseValue, status = :status, location = :location, 
        serialNumber = :serialNumber, notes = :notes
    WHERE id = :id
  `, { id, name, category, purchaseDate, purchaseValue, status, location, serialNumber, notes });

  revalidatePath('/assets');
  revalidatePath(`/assets/${id}`);
  redirect(`/assets/${id}`);
}

export async function deleteAsset(id: number) {
  // Primero eliminamos los historiales de mantenimiento (si no hay CASCADE)
  await db.execute("DELETE FROM asset_maintenance WHERE assetId = :id", { id });
  
  // Luego el activo principal
  await db.execute("DELETE FROM assets WHERE id = :id", { id });

  revalidatePath('/assets');
  redirect('/assets');
}
