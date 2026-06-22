'use server';

import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

export async function uploadLogo(base64Data: string) {
  try {
    // Determine file extension and remove prefix
    const matches = base64Data.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image format');
    }
    
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = matches[2];
    
    const fileName = `custom-logo.png`; 
    
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write to root public/custom-logo.png for backward compatibility (receipts)
    const publicFilePath = path.join(publicDir, fileName);
    fs.writeFileSync(publicFilePath, data, { encoding: 'base64' });
    
    // Write to public/uploads/custom-logo.png
    const uploadsDir = path.join(publicDir, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const uploadsFilePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(uploadsFilePath, data, { encoding: 'base64' });
    
    return { success: true, url: `/uploads/${fileName}?v=${Date.now()}` };
  } catch (error: any) {
    console.error("Logo upload error:", error);
    return { success: false, error: error.message };
  }
}

export async function getCentroSettings() {
  try {
    const [rows] = await db.query("SELECT value FROM app_settings WHERE `key` = 'settings_centro'");
    const row = (rows as any[])[0];
    if (row && row.value) {
      return JSON.parse(row.value);
    }
  } catch (error) {
    console.error("Error reading center settings from database:", error);
  }
  // Fallback default
  return {
    nombre: "Nova Skill",
    rnc: "130-456789-1",
    direccion: "Av. Winston Churchill #45, Distrito Nacional",
    telefono: "(809) 555-0123",
    correo: "contacto@novaskillkids.com",
    periodo: "2023 - 2024",
    strictAgeFiltering: true,
    matriculaAmount: 12000,
    evaluationsRequireObservation: true
  };
}

export async function updateCentroSettings(data: any) {
  try {
    await db.execute(`
      INSERT INTO app_settings (\`key\`, value) 
      VALUES ('settings_centro', ?)
      ON DUPLICATE KEY UPDATE value = VALUES(value)
    `, [JSON.stringify(data)]);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating center settings in database:", error);
    return { success: false, error: error.message };
  }
}

export async function getEvalTemplates() {
  try {
    const [rows] = await db.query("SELECT value FROM app_settings WHERE `key` = 'eval_templates'");
    const row = (rows as any[])[0];
    if (row && row.value) {
      return JSON.parse(row.value);
    }
  } catch (error) {
    console.error("Error reading eval templates from database:", error);
  }
  // Fallback default
  return [
    {
      id: "cognitiva",
      name: "Área Cognitiva",
      indicators: [
        "Reconoce colores",
        "Reconoce números",
        "Reconoce letras",
        "Identifica figuras geométricas",
        "Sigue instrucciones",
        "Resuelve actividades acorde a su edad"
      ]
    },
    {
      id: "lenguaje",
      name: "Área del Lenguaje",
      indicators: [
        "Pronuncia palabras correctamente",
        "Forma oraciones",
        "Comprende instrucciones",
        "Participa en conversaciones",
        "Expresa emociones y necesidades"
      ]
    },
    {
      id: "motora",
      name: "Área Motora",
      indicators: [
        "Motricidad Gruesa: Corre",
        "Motricidad Gruesa: Salta",
        "Motricidad Gruesa: Mantiene equilibrio",
        "Motricidad Gruesa: Sube y baja escaleras",
        "Motricidad Fina: Colorea",
        "Motricidad Fina: Recorta",
        "Motricidad Fina: Manipula objetos pequeños",
        "Motricidad Fina: Escribe o traza líneas"
      ]
    },
    {
      id: "socioemocional",
      name: "Área Socioemocional",
      indicators: [
        "Interactúa con otros niños",
        "Comparte juguetes",
        "Respeta normas",
        "Controla emociones",
        "Participa en actividades grupales"
      ]
    },
    {
      id: "habitos",
      name: "Hábitos y Autonomía",
      indicators: [
        "Come solo",
        "Va al baño solo",
        "Se lava las manos",
        "Organiza sus pertenencias",
        "Sigue rutinas diarias"
      ]
    }
  ];
}

export async function updateEvalTemplates(data: any) {
  try {
    await db.execute(`
      INSERT INTO app_settings (\`key\`, value) 
      VALUES ('eval_templates', ?)
      ON DUPLICATE KEY UPDATE value = VALUES(value)
    `, [JSON.stringify(data)]);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating eval templates in database:", error);
    return { success: false, error: error.message };
  }
}
