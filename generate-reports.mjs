import fs from 'fs';
import path from 'path';

const reports = [
  {
    folder: 'enrollment',
    title: 'Reporte de Matrículas',
    importAction: 'getEnrollmentReport',
    useMonthParams: false,
    tableHeaders: ['No.', 'Alumno', 'Fecha Nac.', 'Género', 'Aula'],
    renderRow: `
      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
      <td className="py-3 px-4 font-medium text-slate-900">{item.firstName} {item.lastName}</td>
      <td className="py-3 px-4 text-slate-600">{new Date(item.dateOfBirth).toLocaleDateString('es-MX')}</td>
      <td className="py-3 px-4 text-slate-600 capitalize">{item.gender}</td>
      <td className="py-3 px-4 font-semibold text-indigo-600">{item.classroomName || 'Sin asignar'}</td>
    `
  },
  {
    folder: 'payments',
    title: 'Reporte de Pagos de Colegiatura',
    importAction: 'getPaymentsReport',
    useMonthParams: true,
    tableHeaders: ['No.', 'Fecha Pago', 'Alumno', 'Monto', 'Método'],
    renderRow: `
      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
      <td className="py-3 px-4 text-slate-600">{new Date(item.date).toLocaleDateString('es-MX')}</td>
      <td className="py-3 px-4 font-medium text-slate-900">{item.firstName} {item.lastName}</td>
      <td className="py-3 px-4 font-bold text-emerald-600">\${item.amount.toLocaleString()}</td>
      <td className="py-3 px-4 text-slate-600">{item.paymentMethod}</td>
    `
  },
  {
    folder: 'income',
    title: 'Reporte de Ingresos Totales',
    importAction: 'getIncomeReport',
    useMonthParams: true,
    tableHeaders: ['No.', 'Fecha', 'Concepto', 'Monto', 'Método'],
    renderRow: `
      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
      <td className="py-3 px-4 text-slate-600">{new Date(item.date).toLocaleDateString('es-MX')}</td>
      <td className="py-3 px-4 font-medium text-slate-900">{item.description}</td>
      <td className="py-3 px-4 font-bold text-emerald-600">\${item.amount.toLocaleString()}</td>
      <td className="py-3 px-4 text-slate-600">{item.paymentMethod}</td>
    `
  },
  {
    folder: 'expenses',
    title: 'Reporte de Egresos Totales',
    importAction: 'getExpensesReport',
    useMonthParams: true,
    tableHeaders: ['No.', 'Fecha', 'Categoría', 'Descripción', 'Monto'],
    renderRow: `
      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
      <td className="py-3 px-4 text-slate-600">{new Date(item.date).toLocaleDateString('es-MX')}</td>
      <td className="py-3 px-4 font-medium text-slate-900">{item.category}</td>
      <td className="py-3 px-4 text-slate-600">{item.description}</td>
      <td className="py-3 px-4 font-bold text-rose-600">\${item.amount.toLocaleString()}</td>
    `
  },
  {
    folder: 'inventory',
    title: 'Reporte de Inventario Actual',
    importAction: 'getInventoryReport',
    useMonthParams: false,
    tableHeaders: ['No.', 'Producto', 'Categoría', 'Stock Actual', 'Estado'],
    renderRow: `
      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
      <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
      <td className="py-3 px-4 text-slate-600">{item.category}</td>
      <td className="py-3 px-4 font-bold text-slate-700">{item.quantity} {item.unit}</td>
      <td className="py-3 px-4">
        {item.quantity <= item.minStock ? (
          <span className="text-rose-600 font-bold text-xs uppercase">Reabastecer</span>
        ) : (
          <span className="text-emerald-600 font-bold text-xs uppercase">Óptimo</span>
        )}
      </td>
    `
  },
  {
    folder: 'staff',
    title: 'Reporte de Personal',
    importAction: 'getStaffReport',
    useMonthParams: false,
    tableHeaders: ['No.', 'Nombre', 'Puesto', 'Teléfono', 'Ingreso'],
    renderRow: `
      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
      <td className="py-3 px-4 font-medium text-slate-900">{item.firstName} {item.lastName}</td>
      <td className="py-3 px-4 font-semibold text-indigo-600 capitalize">{item.role}</td>
      <td className="py-3 px-4 text-slate-600">{item.phone}</td>
      <td className="py-3 px-4 text-slate-600">{new Date(item.hireDate).toLocaleDateString('es-MX')}</td>
    `
  },
  {
    folder: 'cashflow',
    title: 'Reporte de Flujo de Caja (Ledger)',
    importAction: 'getCashflowReport',
    useMonthParams: true,
    tableHeaders: ['No.', 'Fecha', 'Tipo', 'Descripción', 'Monto'],
    renderRow: `
      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
      <td className="py-3 px-4 text-slate-600">{new Date(item.date).toLocaleDateString('es-MX')}</td>
      <td className="py-3 px-4">
        {item.source === 'income' 
          ? <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold uppercase">Ingreso</span>
          : <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-bold uppercase">Egreso</span>
        }
      </td>
      <td className="py-3 px-4 font-medium text-slate-900">{item.description} <span className="text-xs text-slate-400 block">{item.details}</span></td>
      <td className={\`py-3 px-4 font-bold \${item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}\`}>\${item.amount.toLocaleString()}</td>
    `
  },
  {
    folder: 'development',
    title: 'Reporte de Desarrollo Infantil',
    importAction: null,
    useMonthParams: false,
    tableHeaders: ['No.', 'Alumno', 'Hitos Logrados', 'Observaciones'],
    renderRow: `
      <td colSpan={4} className="py-8 text-center text-slate-500 italic">Módulo en desarrollo. Próximamente disponible.</td>
    `
  }
];

const basePath = path.join(process.cwd(), 'src', 'app', 'reports');

for (const report of reports) {
  const dirPath = path.join(basePath, report.folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  let fileContent = `import PrintButton from '../attendance/PrintButton';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
${report.importAction ? `import { ${report.importAction} } from '@/lib/actions/reports';` : ''}

export default async function ReportPage({ searchParams }: { searchParams: { month?: string } }) {
  const now = new Date();
  const currentMonth = searchParams.month || \`\${now.getFullYear()}-\${(now.getMonth() + 1).toString().padStart(2, '0')}\`;
  
  const [year, monthStr] = currentMonth.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
  const displayMonth = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(dateObj);

  ${report.importAction ? 
    (report.useMonthParams ? `const reportData = await ${report.importAction}(currentMonth);` : `const reportData = await ${report.importAction}();`) 
    : 'const reportData: any[] = [];'}

  const publicDir = path.join(process.cwd(), 'public');
  const customLogoPath = path.join(publicDir, 'custom-logo.png');
  let logoSrc = null;
  if (fs.existsSync(customLogoPath)) {
    const logoBuffer = fs.readFileSync(customLogoPath);
    logoSrc = \`data:image/png;base64,\${logoBuffer.toString('base64')}\`;
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white pb-20">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
        <Link href="/reports" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a Reportes
        </Link>
        <div className="flex items-center gap-4">
          ${report.useMonthParams ? `
          <form method="GET" className="flex items-center gap-2">
            <label htmlFor="month" className="text-sm font-medium text-slate-700">Periodo:</label>
            <input 
              type="month" 
              name="month" 
              id="month" 
              defaultValue={currentMonth}
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
            />
            <button type="submit" className="bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-200">
              Ver
            </button>
          </form>` : ''}
          <PrintButton />
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto mt-8 bg-white shadow-xl print:shadow-none print:mt-0 print:max-w-none">
        <div className="p-12">
          
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" className="h-16 w-16 object-contain" />
              ) : (
                <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                  <span className="text-slate-400 font-bold text-xs">LOGO</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Estancia Infantil</h1>
                <p className="text-sm text-slate-500">${report.title}</p>
              </div>
            </div>
            <div className="text-right">
              ${report.useMonthParams ? `
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Periodo Reportado</p>
              <p className="text-lg font-bold text-slate-800 capitalize">{displayMonth}</p>
              ` : `
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Corte a Fecha</p>
              <p className="text-lg font-bold text-slate-800 capitalize">Actual</p>
              `}
              <p className="text-xs text-slate-500 mt-2">
                Generado el: {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(now)}
              </p>
            </div>
          </div>

          <table className="w-full text-left text-sm border-collapse mb-12">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50">
                ${report.tableHeaders.map(th => `<th className="py-3 px-4 font-semibold text-slate-800">${th}</th>`).join('\n                ')}
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 && ${report.importAction !== null} ? (
                <tr>
                  <td colSpan={${report.tableHeaders.length}} className="py-8 text-center text-slate-500 italic">No hay datos para mostrar en este periodo.</td>
                </tr>
              ) : (
                reportData.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-slate-200 last:border-b-0">
                    ${report.renderRow}
                  </tr>
                ))
              )}
              ${report.importAction === null ? `
                <tr>
                   ${report.renderRow}
                </tr>
              ` : ''}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-16 mt-20 pt-8">
            <div className="text-center">
              <div className="border-t border-slate-400 w-64 mx-auto pt-2">
                <p className="font-bold text-slate-800 text-sm">Firma de Maestra Titular</p>
                <p className="text-xs text-slate-500 mt-1">Nombre y Firma</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 w-64 mx-auto pt-2">
                <p className="font-bold text-slate-800 text-sm">Sello / Firma de Dirección</p>
                <p className="text-xs text-slate-500 mt-1">Visto Bueno</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), fileContent);
  console.log('Generated', report.folder);
}

// Special case for Financial State Report since it has a completely different layout (summary blocks rather than table)
const finPath = path.join(basePath, 'financial');
if (!fs.existsSync(finPath)) fs.mkdirSync(finPath, { recursive: true });
const finContent = `import PrintButton from '../attendance/PrintButton';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getFinancialStateReport } from '@/lib/actions/reports';

export default async function FinancialReportPage({ searchParams }: { searchParams: { month?: string } }) {
  const now = new Date();
  const currentMonth = searchParams.month || \`\${now.getFullYear()}-\${(now.getMonth() + 1).toString().padStart(2, '0')}\`;
  
  const [year, monthStr] = currentMonth.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
  const displayMonth = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(dateObj);

  const reportData = await getFinancialStateReport(currentMonth);

  const publicDir = path.join(process.cwd(), 'public');
  const customLogoPath = path.join(publicDir, 'custom-logo.png');
  let logoSrc = null;
  if (fs.existsSync(customLogoPath)) {
    const logoBuffer = fs.readFileSync(customLogoPath);
    logoSrc = \`data:image/png;base64,\${logoBuffer.toString('base64')}\`;
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white pb-20">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
        <Link href="/reports" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a Reportes
        </Link>
        <div className="flex items-center gap-4">
          <form method="GET" className="flex items-center gap-2">
            <label htmlFor="month" className="text-sm font-medium text-slate-700">Periodo:</label>
            <input 
              type="month" 
              name="month" 
              id="month" 
              defaultValue={currentMonth}
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
            />
            <button type="submit" className="bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-200">
              Ver
            </button>
          </form>
          <PrintButton />
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto mt-8 bg-white shadow-xl print:shadow-none print:mt-0 print:max-w-none">
        <div className="p-12">
          
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" className="h-16 w-16 object-contain" />
              ) : (
                <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                  <span className="text-slate-400 font-bold text-xs">LOGO</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Estancia Infantil</h1>
                <p className="text-sm text-slate-500">Estado Financiero (Resultados)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Periodo Reportado</p>
              <p className="text-lg font-bold text-slate-800 capitalize">{displayMonth}</p>
              <p className="text-xs text-slate-500 mt-2">
                Generado el: {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(now)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
              <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Total Ingresos</p>
              <p className="text-4xl font-black text-emerald-600 mt-2">$\${reportData.totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl">
              <p className="text-sm font-bold text-rose-800 uppercase tracking-wider">Total Egresos</p>
              <p className="text-4xl font-black text-rose-600 mt-2">$\${reportData.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 border-t-4 border-slate-800 p-8 rounded-xl mb-12">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Utilidad Neta del Ejercicio</p>
            <p className="text-5xl font-black text-slate-900 mt-2">$\${reportData.netProfit.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-2">
              {reportData.netProfit >= 0 ? 'La estancia operó con superávit este mes.' : 'La estancia operó con déficit este mes.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16 mt-20 pt-8">
            <div className="text-center">
              <div className="border-t border-slate-400 w-64 mx-auto pt-2">
                <p className="font-bold text-slate-800 text-sm">Firma de Contabilidad</p>
                <p className="text-xs text-slate-500 mt-1">Nombre y Firma</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 w-64 mx-auto pt-2">
                <p className="font-bold text-slate-800 text-sm">Sello / Firma de Dirección</p>
                <p className="text-xs text-slate-500 mt-1">Visto Bueno</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}`;
fs.writeFileSync(path.join(finPath, 'page.tsx'), finContent);
console.log('Generated financial');
