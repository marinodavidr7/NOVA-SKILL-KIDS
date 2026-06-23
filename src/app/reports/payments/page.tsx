import PrintButton from '../attendance/PrintButton';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPaymentsReport } from '@/lib/actions/reports';

export default async function ReportPage({ searchParams }: { searchParams: { month?: string } }) {
  const now = new Date();
  const currentMonth = searchParams.month || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const [year, monthStr] = currentMonth.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
  const displayMonth = new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' }).format(dateObj);

  const reportData = await getPaymentsReport(currentMonth);

  const publicDir = path.join(process.cwd(), 'public');
  const customLogoPath = path.join(publicDir, 'custom-logo.png');
  let logoSrc = null;
  if (fs.existsSync(customLogoPath)) {
    const logoBuffer = fs.readFileSync(customLogoPath);
    logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;
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
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Nova Skill Kids</h1>
                <p className="text-sm text-slate-500">Reporte de Pagos de Colegiatura</p>
              </div>
            </div>
            <div className="text-right">
              
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Periodo Reportado</p>
              <p className="text-lg font-bold text-slate-800 capitalize">{displayMonth}</p>
              
              <p className="text-xs text-slate-500 mt-2">
                Generado el: {new Intl.DateTimeFormat('es-DO', { dateStyle: 'long' }).format(now)}
              </p>
            </div>
          </div>

          <table className="w-full text-left text-sm border-collapse mb-12">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50">
                <th className="py-3 px-4 font-semibold text-slate-800">No.</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Fecha Pago</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Alumno</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Monto</th>
                <th className="py-3 px-4 font-semibold text-slate-800">Método</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 && true ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">No hay datos para mostrar en este periodo.</td>
                </tr>
              ) : (
                reportData.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-slate-200 last:border-b-0">
                    
      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
      <td className="py-3 px-4 text-slate-600">{new Date(item.date).toLocaleDateString('es-DO')}</td>
      <td className="py-3 px-4 font-medium text-slate-900">{item.firstName} {item.lastName}</td>
      <td className="py-3 px-4 font-bold text-emerald-600">${item.amount.toLocaleString()}</td>
      <td className="py-3 px-4 text-slate-600">{item.paymentMethod}</td>
    
                  </tr>
                ))
              )}
              
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
