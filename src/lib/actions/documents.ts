'use server'

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import fs from 'fs'
import path from 'path'

// ==========================================
// DOCUMENTOS
// ==========================================

export async function getDocuments(categoryId?: number, entityType?: string) {
  let query = `
    SELECT d.*, c.name as categoryName, u.firstName as uploaderFirstName, u.lastName as uploaderLastName
    FROM documents d
    JOIN document_categories c ON d.categoryId = c.id
    LEFT JOIN users u ON d.uploadedBy = u.id
    WHERE d.status != 'Eliminado'
  `;
  const params: any[] = [];

  if (categoryId) {
    query += ` AND d.categoryId = ?`;
    params.push(categoryId);
  }
  if (entityType) {
    query += ` AND d.entityType = ?`;
    params.push(entityType);
  }

  query += ` ORDER BY d.createdAt DESC`;
  const [rows] = await db.query(query, params);
  return rows as any[];
}

export async function getDocumentById(id: number) {
  const [rows] = await db.query(`
    SELECT d.*, c.name as categoryName
    FROM documents d
    JOIN document_categories c ON d.categoryId = c.id
    WHERE d.id = ?
  `, [id]);
  const doc = (rows as any[])[0];

  if (doc) {
    const [versions] = await db.query(`SELECT * FROM document_versions WHERE documentId = ? ORDER BY versionNumber DESC`, [id]);
    doc.versions = versions;
  }
  return doc;
}

export async function getDocumentsByEntity(entityType: string, entityId: number) {
  const [rows] = await db.query(`
    SELECT d.*, c.name as categoryName, u.firstName as uploaderFirstName, u.lastName as uploaderLastName
    FROM documents d
    JOIN document_categories c ON d.categoryId = c.id
    LEFT JOIN users u ON d.uploadedBy = u.id
    WHERE d.entityType = ? AND d.entityId = ? AND d.status != 'Eliminado'
    ORDER BY d.createdAt DESC
  `, [entityType, entityId]);
  return rows as any[];
}

export async function getCategories() {
  const [rows] = await db.query(`SELECT * FROM document_categories ORDER BY name`);
  return rows as any[];
}

export async function uploadDocument(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No autorizado');

    const file = formData.get('file') as File;
    const categoryIdStr = formData.get('categoryId') as string;
    if (!file || !categoryIdStr) throw new Error('Datos incompletos');

    const categoryId = parseInt(categoryIdStr, 10);

    const description = formData.get('description') as string || '';
    const entityIdStr = formData.get('entityId') as string;
    const documentType = formData.get('documentType') as string || file.type || 'application/octet-stream';
    const expirationDate = formData.get('expirationDate') as string || null;

    const entityId = entityIdStr ? parseInt(entityIdStr, 10) : null;
    const entityType = formData.get('entityType') as string || (entityId ? 'Assigned' : 'General');

    // Read file via ArrayBuffer instead of base64 to avoid Next.js IPC payload limits
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Simulate file saving to local disk
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'docs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, uniqueName);
    const fileUrl = `/uploads/docs/${uniqueName}`;

    fs.writeFileSync(filePath, buffer);

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const [result] = await conn.execute(`
        INSERT INTO documents (title, description, categoryId, entityType, entityId, documentType, fileUrl, fileType, fileSize, expirationDate, uploadedBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        file.name,
        description,
        categoryId,
        entityType,
        entityId,
        documentType,
        fileUrl,
        file.type || 'unknown',
        file.size,
        expirationDate,
        user.id
      ]);

      const docId = (result as any).insertId;

      // Save initial version
      await conn.execute(`
        INSERT INTO document_versions (documentId, fileUrl, fileType, fileSize, versionNumber, uploadedBy)
        VALUES (?, ?, ?, ?, 1, ?)
      `, [docId, fileUrl, file.type || 'unknown', file.size, user.id]);

      // Log access
      await conn.execute(`INSERT INTO document_access_log (documentId, userId, action) VALUES (?, ?, 'uploaded')`, [docId, user.id]);

      await conn.commit();
      conn.release();

      revalidatePath('/', 'layout');
      return { success: true, id: docId };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      return { success: false, error: e.message };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addDocumentVersion(documentId: number, fileBase64: string, fileName: string, fileType: string, fileSize: number) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No autorizado');

    const [rows] = await db.query(`SELECT * FROM documents WHERE id = ?`, [documentId]);
    const doc = (rows as any[])[0];
    if (!doc) throw new Error('Documento no encontrado');

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'docs');
    const uniqueName = `${Date.now()}_v_${fileName}`;
    const filePath = path.join(uploadDir, uniqueName);
    const fileUrl = `/uploads/docs/${uniqueName}`;

    const base64Data = fileBase64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const [vRows] = await conn.query(`SELECT MAX(versionNumber) as maxV FROM document_versions WHERE documentId = ?`, [documentId]);
      const latestVersion = (vRows as any[])[0];
      const newVersionNum = (latestVersion.maxV || 1) + 1;

      await conn.execute(`
        INSERT INTO document_versions (documentId, fileUrl, fileType, fileSize, versionNumber, uploadedBy)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [documentId, fileUrl, fileType, fileSize, newVersionNum, user.id]);

      await conn.execute(`
        UPDATE documents SET fileUrl = ?, fileType = ?, fileSize = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
      `, [fileUrl, fileType, fileSize, documentId]);

      await conn.execute(`INSERT INTO document_access_log (documentId, userId, action) VALUES (?, ?, 'new_version')`, [documentId, user.id]);

      await conn.commit();
      conn.release();

      revalidatePath(`/documents/${documentId}`);
      return { success: true };
    } catch (e: any) {
      await conn.rollback();
      conn.release();
      return { success: false, error: e.message };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(id: number) {
  try {
    const user = await getCurrentUser();
    await db.execute(`UPDATE documents SET status = 'Eliminado' WHERE id = ?`, [id]);
    await db.execute(`INSERT INTO document_access_log (documentId, userId, action) VALUES (?, ?, 'deleted')`, [id, user?.id || 0]);
    revalidatePath('/documents');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// DASHBOARD & ALERTAS
// ==========================================

export async function getDocumentStats() {
  const [totalRows] = await db.query(`SELECT count(*) as count FROM documents WHERE status != 'Eliminado'`);
  const totalDocs = (totalRows as any[])[0];
  
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];

  const [expiringDocs] = await db.query(`
    SELECT d.id, d.title, d.expirationDate, c.name as categoryName 
    FROM documents d
    JOIN document_categories c ON d.categoryId = c.id
    WHERE d.expirationDate >= ? AND d.expirationDate <= ? AND d.status != 'Eliminado'
    ORDER BY d.expirationDate ASC
  `, [todayStr, thirtyDaysStr]);

  const [expiredDocs] = await db.query(`
    SELECT d.id, d.title, d.expirationDate, c.name as categoryName 
    FROM documents d
    JOIN document_categories c ON d.categoryId = c.id
    WHERE d.expirationDate < ? AND d.status != 'Eliminado'
    ORDER BY d.expirationDate DESC
  `, [todayStr]);

  return {
    totalDocs: totalDocs.count,
    expiringDocs: expiringDocs as any[],
    expiredDocs: expiredDocs as any[]
  };
}
