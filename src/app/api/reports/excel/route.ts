import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

const SECRET_TOKEN = 'NovaSkill2026';

function jsonToCsv(rows: any[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [];
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data
  for (const row of rows) {
    const values = headers.map(header => {
      let val = row[header] ?? '';
      const strVal = String(val).replace(/"/g, '""');
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal}"`;
      }
      return strVal;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  if (token !== SECRET_TOKEN) {
    return new NextResponse('Acceso Denegado. Token inválido.', { status: 401 });
  }

  let data: any[] = [];
  let filename = 'reporte.csv';

  try {
    switch (type) {
      case 'finanzas':
        filename = 'flujo_caja.csv';
        const [finanzas] = await db.query<RowDataPacket[]>(`
          SELECT 
            t.id AS ID, 
            DATE_FORMAT(t.date, '%Y-%m-%d %H:%i') AS Fecha,
            t.type AS Tipo,
            t.amount AS Monto,
            t.category AS Categoria,
            t.description AS Descripcion,
            a.name AS Cuenta
          FROM finance_transactions t
          LEFT JOIN finance_accounts a ON t.accountId = a.id
          ORDER BY t.date DESC
        `);
        data = finanzas;
        break;

      case 'alumnos':
        filename = 'alumnos_activos.csv';
        const [alumnos] = await db.query<RowDataPacket[]>(`
          SELECT 
            c.id AS ID,
            CONCAT(c.firstName, ' ', c.lastName) AS NombreCompleto,
            c.age AS Edad,
            c.status AS Estado,
            p.name AS PaqueteActual
          FROM children c
          LEFT JOIN subscriptions s ON c.id = s.childId AND s.status = 'active'
          LEFT JOIN subscription_packages p ON s.packageId = p.id
        `);
        data = alumnos;
        break;

      case 'deudas':
        filename = 'cuentas_por_cobrar.csv';
        const [deudas] = await db.query<RowDataPacket[]>(`
          SELECT 
            i.id AS ID,
            CONCAT(c.firstName, ' ', c.lastName) AS Alumno,
            i.amount AS Monto,
            DATE_FORMAT(i.dueDate, '%Y-%m-%d') AS Vencimiento,
            i.description AS Concepto
          FROM income i
          JOIN children c ON i.childId = c.id
          WHERE i.status = 'pending'
          ORDER BY i.dueDate ASC
        `);
        data = deudas;
        break;

      default:
        return new NextResponse('Tipo de reporte no válido. Usa type=finanzas, type=alumnos, o type=deudas', { status: 400 });
    }

    const csvData = jsonToCsv(data);

    // Provide UTF-8 BOM so Excel opens it with correct accents
    const bom = '\uFEFF';

    return new NextResponse(bom + csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error generating Excel export:', error);
    return new NextResponse('Error interno del servidor al generar el reporte', { status: 500 });
  }
}
