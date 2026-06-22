import { getIncomeReceipt } from '@/lib/actions/finance';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import PrintButton from './PrintButton';

export default async function TuitionReceiptPage({ params }: { params: Promise<{ incomeId: string }> }) {
  const { incomeId } = await params;

  const receipt = await getIncomeReceipt(incomeId);
  if (!receipt) notFound();

  // Check if custom logo exists
  const publicDir = path.join(process.cwd(), 'public');
  const logoPath = path.join(publicDir, 'custom-logo.png');
  const hasLogo = fs.existsSync(logoPath);
  const logoUrl = hasLogo ? `/custom-logo.png?v=${Date.now()}` : null;

  const paymentDate = new Date(receipt.date).toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const parentFullName = receipt.parentFirstName ? `${receipt.parentFirstName} ${receipt.parentLastName}` : 'No Registrado';
  const parentPhone = receipt.parentPhone || 'N/A';
  const parentAddress = receipt.parentAddress || 'N/A';
  const childFullName = receipt.childFirstName ? `${receipt.childFirstName} ${receipt.childLastName}` : 'N/A';

  return (
    <>
      <style>{`
        body { background: white; margin: 0; padding: 0; }
        @media print {
          /* Margin 0 hides the default browser header/footer URLs and dates */
          @page { margin: 0; size: portrait; }
          body { 
            background: white; 
            padding: 1.5cm !important; /* Adds padding back inside the paper */
            margin: 0 !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="max-w-3xl mx-auto p-12 print:p-0 print:max-w-none print:w-full bg-white text-slate-900 font-sans">
        {/* Print Button (hidden when printing) */}
        <div className="mb-10 text-right no-print">
          <PrintButton />
          <p className="text-xs text-slate-400 mt-2">Nota: Los encabezados de navegador se ocultan automáticamente al imprimir.</p>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-[3px] border-indigo-900 pb-8 mb-10">
          <div className="flex items-center gap-6">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-24 w-24 object-contain" />
            )}
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-indigo-950 uppercase">NOVA SKILL KIDS</h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-[0.2em]">Recibo Oficial de Ingreso</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-slate-50 px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1 tracking-wider">Folio No.</p>
              <p className="text-2xl font-black text-indigo-600">#{receipt.id.toString().padStart(6, '0')}</p>
            </div>
          </div>
        </div>

        {/* Billing Details */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          {/* Bill To */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Facturado a</h3>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900">{parentFullName}</p>
              <p className="text-sm text-slate-600">Tel: {parentPhone}</p>
              <p className="text-sm text-slate-600">{parentAddress}</p>
            </div>
          </div>

          {/* Receipt Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Detalles del Recibo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Fecha</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{paymentDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Método de Pago</p>
                <p className="text-sm font-medium text-slate-900">{receipt.paymentMethod}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Alumno Referencia</p>
                <div className="flex items-center gap-3 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {receipt.photoUrl && (
                    <img src={receipt.photoUrl} alt="Alumno" className="h-8 w-8 rounded-full object-cover shadow-sm" />
                  )}
                  <p className="text-sm font-bold text-slate-800">{childFullName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden mb-10 shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Concepto y Descripción</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="py-6 px-6 border-b border-slate-50">
                  <p className="font-bold text-lg text-slate-900">{receipt.description}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Periodo Lectivo: <span className="font-semibold text-slate-700">{receipt.period}</span>
                  </p>
                </td>
                <td className="py-6 px-6 text-right font-black text-xl text-slate-900 border-b border-slate-50">
                  ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td className="py-6 px-6 text-right font-bold text-sm text-slate-500 uppercase tracking-widest">
                  Total Pagado
                </td>
                <td className="py-6 px-6 text-right">
                  <span className="font-black text-3xl text-indigo-700">
                    ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-center text-sm text-slate-500 mb-16 bg-slate-50 py-3 rounded-lg border border-slate-100">
          <p>Cantidad con letra: <span className="font-semibold italic text-slate-700">-- El presente documento ampara la cantidad total expresada numéricamente --</span></p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-32 px-8">
          <div className="text-center">
            <div className="border-b-2 border-slate-800 w-full mb-3"></div>
            <p className="text-sm font-bold text-slate-900 uppercase">Administración</p>
            <p className="text-xs text-slate-500 mt-1">Sello o Firma Autorizada</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-slate-800 w-full mb-3"></div>
            <p className="text-sm font-bold text-slate-900 uppercase">Firma de Conformidad</p>
            <p className="text-xs text-slate-500 mt-1">Nombre y Firma del Tutor</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-20 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Nova Skill Kids • Comprobante Interno de Ingreso</p>
          <p className="text-xs text-slate-400 mt-1">Conserve este documento para cualquier aclaración o trámite futuro.</p>
        </div>

        {/* Auto print script */}
        <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
      </div>
    </>
  );
}
