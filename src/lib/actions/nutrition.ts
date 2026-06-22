'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/actions/auth';

/**
 * Guarda un menú, comprobando si existen alergias cruzadas con los niños activos
 */
export async function saveMenu(data: {
  date: string;
  mealType: string;
  description: string;
  allergens: string[]; // ['Gluten', 'Lácteos']
  beverage?: string;
  forceSaveWithAlternatives?: boolean;
}) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin' && !user?.permissions?.planMenu) {
    return {
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'No tienes permiso para planear el menú.'
    };
  }

  const { date, mealType, description, allergens, beverage = '' } = data;
  
  // 1. OBTENER NIÑOS ACTIVOS Y SUS ALERGIAS
  const [activeChildren] = await db.query(`
    SELECT c.id, c.firstName, c.lastName, m.allergies
    FROM children c
    LEFT JOIN medical_records m ON c.id = m.child_id
    WHERE c.status = 'active'
  `) as any[];

  // 2. CRUZAR ALERGIAS
  const affectedChildren: any[] = [];
  const menuAllergensStr = allergens.join(', ').toLowerCase();
  const descriptionLower = description.toLowerCase();

  for (const child of activeChildren) {
    if (!child.allergies) continue;
    
    // Parse the long string "Alimentaria: Huevos (Clara), Piel: Urticaria" into base words
    const childAllergiesRaw = child.allergies.toLowerCase().split(',').map((a: string) => a.trim());
    
    let isAffected = false;
    let triggeringAllergen = '';

    for (const rawAllergen of childAllergiesRaw) {
      // 1. Remove prefixes like "alimentaria: " or "medicamentos: "
      const cleanAllergen = rawAllergen.replace(/^[^:]+:\s*/, '');
      
      // 2. Extract the main word before parentheses (e.g., "huevos (clara)" -> "huevos")
      const mainWordMatch = cleanAllergen.match(/^([^(]+)/);
      const mainWord = mainWordMatch ? mainWordMatch[1].trim() : cleanAllergen;
      
      // 3. Extract word inside parentheses if any (e.g. "clara")
      const parenMatch = cleanAllergen.match(/\(([^)]+)\)/);
      const subWord = parenMatch ? parenMatch[1].trim() : '';

      // A. Comprobar contra etiquetas (Etiquetado Estricto)
      if (menuAllergensStr.includes(mainWord) || (subWord && menuAllergensStr.includes(subWord))) {
        isAffected = true;
        triggeringAllergen = rawAllergen;
        break;
      }

      // B. Comprobar contra la descripción directamente usando LIKE (Escaneo de Texto)
      if (descriptionLower.includes(mainWord) || (subWord && descriptionLower.includes(subWord))) {
        isAffected = true;
        triggeringAllergen = rawAllergen;
        break;
      }
    }

    if (isAffected) {
      affectedChildren.push({
        ...child,
        triggeringAllergen
      });
    }
  }

  // 3. SI HAY NIÑOS AFECTADOS, DEVOLVER ALERTA (NO GUARDAR TODAVÍA)
  // El front-end recibirá esta alerta y forzará al usuario a proporcionar menús alternativos
  if (affectedChildren.length > 0 && !data.forceSaveWithAlternatives) {
    return {
      status: 'error',
      code: 'ALLERGY_COLLISION',
      message: 'Se detectaron alergias con el menú propuesto.',
      affectedChildren
    };
  }

  // 4. GUARDAR MENÚ SI ES SEGURO (O SI YA NOS MANDARON LAS ALTERNATIVAS)
  const [result] = await db.execute(`
    INSERT INTO menus (date, mealType, description, allergens, beverage)
    VALUES (:date, :mealType, :description, :allergens, :beverage)
  `, { date, mealType, description, allergens: allergens.join(', '), beverage }) as any[];
  
  const menuId = result.insertId;

  revalidatePath('/nutrition');
  
  return {
    status: 'success',
    menuId
  };
}

/**
 * Guarda las alternativas a un menú bloqueado
 */
export async function saveMenuAlternatives(menuId: number, alternatives: { childId: number, description: string }[]) {
  try {
    await db.query('BEGIN');
    for (const alt of alternatives) {
      await db.execute(`
        INSERT INTO menu_alternatives (menu_id, child_id, description)
        VALUES (:menuId, :childId, :description)
      `, { menuId, childId: alt.childId, description: alt.description });
    }
    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  }
  
  revalidatePath('/nutrition');
  return { status: 'success' };
}

/**
 * Obtiene los menús para una fecha específica o rango
 */
export async function getMenusByDate(date: string) {
  const [menus] = await db.query(`
    SELECT * FROM menus 
    WHERE date = :date 
    ORDER BY 
      CASE mealType 
        WHEN 'Desayuno' THEN 1 
        WHEN 'Colación' THEN 2 
        WHEN 'Comida' THEN 3 
        ELSE 4 
      END
  `, { date }) as any[];

  // Traer las alternativas para estos menús
  for (const menu of menus) {
    const [alternatives] = await db.query(`
      SELECT a.*, c.firstName, c.lastName 
      FROM menu_alternatives a
      JOIN children c ON a.child_id = c.id
      WHERE a.menu_id = :menuId
    `, { menuId: menu.id }) as any[];
    menu.alternatives = alternatives;
  }

  return menus;
}

/**
 * Elimina un menú y sus alternativas asociadas
 */
export async function deleteMenu(menuId: number) {
  try {
    await db.query('BEGIN');
    await db.execute('DELETE FROM menu_alternatives WHERE menu_id = :menuId', { menuId });
    await db.execute('DELETE FROM menus WHERE id = :menuId', { menuId });
    await db.query('COMMIT');
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  }
  revalidatePath('/nutrition');
  return { status: 'success' };
}
