import PrintButton from '../attendance/PrintButton';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getFinancialStateReport } from '@/lib/actions/reports';

export default async function FinancialReportPage({ searchParams }: { searchParams: { month?: string } }) {
  const now = new Date();
  const currentMonth = searchParams.month || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const [year, monthStr] = currentMonth.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
  const displayMonth = new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' }).format(dateObj);

  const reportData = await getFinancialStateReport(currentMonth);

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
                <p className="text-sm text-slate-500">Estado Financiero (Resultados)</p>
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

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
              <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Total Ingresos</p>
              <p className="text-4xl font-black text-emerald-600 mt-2">$${reportData.totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl">
              <p className="text-sm font-bold text-rose-800 uppercase tracking-wider">Total Egresos</p>
              <p className="text-4xl font-black text-rose-600 mt-2">$${reportData.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 border-t-4 border-slate-800 p-8 rounded-xl mb-12">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Utilidad Neta del Ejercicio</p>
            <p className="text-5xl font-black text-slate-900 mt-2">$${reportData.netProfit.toLocaleString()}</p>
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
}