import { getPayrollById } from '@/lib/actions/staff';
import db from '@/lib/db';
import { notFound } from 'next/navigation';

import fs from 'fs';
import path from 'path';

export default async function ReceiptPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ start: string, end: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const resolvedSearchParams = await searchParams;
  const { start, end } = resolvedSearchParams;

  const [[staff]] = await db.query("SELECT * FROM staff WHERE id = ?", [id]) as any;
  if (!staff) notFound();

  let payroll = await getPayrollById(id, start, end);
  let isDraft = false;

  if (!payroll) {
    // Generate draft payroll
    isDraft = true;
    let base = staff.salary || 0;
    
    // Default to Quincenal if no config found, though we could fetch it
    try {
      const [[config]] = await db.query("SELECT frequency FROM payroll_config LIMIT 1") as any;
      if (config?.frequency === 'Quincenal') base = base / 2;
      if (config?.frequency === 'Semanal') base = base / 4;
    } catch(e) {}

    // @ts-ignore - searchParams typing
    const bonus = parseFloat(searchParams.bonus || '0');
    // @ts-ignore
    const deduction = parseFloat(searchParams.deduction || '0');

    payroll = {
      id: 'BORRADOR',
      paymentDate: new Date().toISOString(),
      baseSalary: base,
      bonuses: bonus,
      deductions: deduction,
      netPay: base + bonus - deduction,
      status: 'pending'
    };
  }

  const startDate = new Date(start).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const endDate = new Date(end).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const paymentDate = new Date(payroll.paymentDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  // Check if custom logo exists
  const publicDir = path.join(process.cwd(), 'public');
  const logoPath = path.join(publicDir, 'custom-logo.png');
  const hasLogo = fs.existsSync(logoPath);
  const logoUrl = hasLogo ? `/custom-logo.png?v=${Date.now()}` : null;

  return (
    <>
      <style>{`
        body { background: white; margin: 0; padding: 0; }
        @media print {
          @page { margin: 0; }
          body { padding: 2cm; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="max-w-3xl mx-auto p-12 bg-white min-h-screen text-slate-900 font-sans">
        {/* Print Button (hidden when printing) */}
        <div className="mb-8 text-right no-print">
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm"
          >
            Imprimir Recibo
          </button>
        </div>

        {/* Receipt Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
            )}
            <div>
              <h1 className="text-4xl font-black tracking-tight text-indigo-900">NOVA SKILL KIDS</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Recibo de Nómina</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p><span className="font-semibold">Fecha de Emisión:</span> {paymentDate}</p>
            <p><span className="font-semibold">ID Recibo:</span> {isDraft ? <span className="text-amber-600 font-bold bg-amber-100 px-2 py-0.5 rounded">BORRADOR</span> : `#${payroll.id.toString().padStart(6, '0')}`}</p>
          </div>
        </div>

        {/* Employee Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">Datos del Empleado</h3>
            <p className="text-lg font-bold text-slate-900">{staff.firstName} {staff.lastName}</p>
            <p className="text-sm text-slate-600 mt-1">Cargo: <span className="font-medium">{staff.role}</span></p>
            <p className="text-sm text-slate-600 mt-1">ID Empleado: <span className="font-medium">EMP-{staff.id.toString().padStart(4, '0')}</span></p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">Periodo de Pago</h3>
            <p className="text-sm font-medium">Del <span className="text-indigo-700">{startDate}</span></p>
            <p className="text-sm font-medium mt-1">Al <span className="text-indigo-700">{endDate}</span></p>
          </div>
        </div>

        {/* Financial Details */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-3 text-sm font-bold text-slate-600 uppercase">Concepto</th>
              <th className="text-right py-3 text-sm font-bold text-slate-600 uppercase">Monto</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            <tr className="border-b border-slate-100">
              <td className="py-4 font-medium">Salario Base</td>
              <td className="py-4 text-right">${payroll.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            {payroll.bonuses > 0 && (
              <tr className="border-b border-slate-100">
                <td className="py-4 font-medium text-emerald-600">Bonos y Extras</td>
                <td className="py-4 text-right text-emerald-600">+ ${payroll.bonuses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            )}
            {payroll.deductions > 0 && (
              <tr className="border-b border-slate-100">
                <td className="py-4 font-medium text-rose-600">Deducciones (Seguro, Faltas, etc.)</td>
                <td className="py-4 text-right text-rose-600">- ${payroll.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-4 border-slate-900 bg-slate-50">
              <td className="py-4 px-4 font-bold text-lg text-slate-900 uppercase">Total Neto Recibido</td>
              <td className="py-4 px-4 text-right font-black text-2xl text-indigo-700">
                ${payroll.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-24">
          <div className="text-center">
            <div className="border-b border-slate-400 w-full mb-2"></div>
            <p className="text-sm font-semibold text-slate-700">Firma del Empleador</p>
            <p className="text-xs text-slate-500 mt-1">Sello de Nova Skill Kids</p>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 w-full mb-2"></div>
            <p className="text-sm font-semibold text-slate-700">Firma del Empleado</p>
            <p className="text-xs text-slate-500 mt-1">Recibí conforme</p>
          </div>
        </div>

        {/* Auto print script */}
        <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
      </div>
    </>
  );
}
