import { getPendingReceivables } from '@/lib/actions/finance';
import { getCentroSettings } from '@/lib/actions/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, Search, Send, User, Users, CalendarDays, ArrowLeft, MessageCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function ReceivablesPage() {
  const receivables = await getPendingReceivables();
  const centroSettings = await getCentroSettings();
  const centroName = centroSettings?.nombre || 'Nova Skill Kids';
  
  const totalDue = receivables.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const getDaysDiff = (dueDateStr: string) => {
    if (!dueDateStr) return 0;
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diff = now.getTime() - dueDate.getTime();
    return Math.floor(diff / (1000 * 3600 * 24)); // Positive means late, Negative means upcoming
  };

  const overdue = receivables.filter(r => getDaysDiff(r.dueDate || r.date) > 0);
  const totalOverdue = overdue.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  
  const dueSoon = receivables.filter(r => {
    const d = getDaysDiff(r.dueDate || r.date);
    return d <= 0 && d >= -7;
  });
  const totalDueSoon = dueSoon.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 animate-fade-in pb-10">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl bg-white p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex items-start gap-4">
            <Link href="/finance" className="p-2.5 mt-1 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                Cuentas por Cobrar
              </h1>
              <p className="mt-2 text-slate-500 max-w-2xl">
                Monitorea los ingresos pendientes y gestiona recordatorios de pago para reducir la morosidad.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right min-w-[140px]">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pendiente</p>
              <p className="text-2xl font-black text-slate-900">${totalDue.toFixed(2)}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-right min-w-[140px]">
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center justify-end gap-1"><AlertTriangle className="w-3 h-3"/> Vencido</p>
              <p className="text-2xl font-black text-rose-700">${totalOverdue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">Lista de Deudores</h2>
          </div>
          
          {receivables.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6">
                <AlertCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">¡Todo al día!</h3>
              <p className="mt-2 text-slate-500">No hay cuentas por cobrar pendientes en este momento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-5">Padre / Tutor</th>
                    <th className="px-6 py-5">Niño</th>
                    <th className="px-6 py-5">Concepto</th>
                    <th className="px-6 py-5">Monto</th>
                    <th className="px-6 py-5">Vencimiento</th>
                    <th className="px-6 py-5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receivables.map((invoice, idx) => {
                    const dueDateStr = invoice.dueDate || invoice.date;
                    const daysDiff = getDaysDiff(dueDateStr);
                    const isOverdue = daysDiff > 0;
                    
                    // Determine Risk Level
                    let riskColor = 'bg-slate-50 border-slate-200 text-slate-700';
                    let riskLabel = 'Al día';
                    
                    if (daysDiff > 30) {
                      riskColor = 'bg-red-100 border-red-200 text-red-800';
                      riskLabel = 'Crítico';
                    } else if (daysDiff > 0) {
                      riskColor = 'bg-rose-100 border-rose-200 text-rose-700';
                      riskLabel = 'Vencido';
                    } else if (daysDiff >= -7) {
                      riskColor = 'bg-amber-100 border-amber-200 text-amber-800';
                      riskLabel = 'Próximo';
                    } else {
                      riskColor = 'bg-emerald-100 border-emerald-200 text-emerald-800';
                      riskLabel = 'A tiempo';
                    }

                    // WhatsApp Message Template
                    const parentName = invoice.parentFirst ? `${invoice.parentFirst} ${invoice.parentLast || ''}` : 'Estimado padre';
                    const phone = invoice.parentPhone ? invoice.parentPhone.replace(/\D/g, '') : '';
                    const formattedAmount = `$${parseFloat(invoice.amount).toFixed(2)}`;
                    const message = encodeURIComponent(`Hola ${parentName},\nLe saludamos de ${centroName}. Le escribimos para recordarle amablemente que tiene un saldo pendiente de ${formattedAmount} correspondiente a "${invoice.description || 'Ingreso'}".\nPor favor contáctenos si tiene alguna duda. ¡Gracias!`);
                    const waLink = phone ? `https://wa.me/52${phone}?text=${message}` : null;
                    
                    return (
                      <tr 
                        key={invoice.id || idx} 
                        className={`transition-colors hover:bg-slate-50 group ${isOverdue ? 'bg-rose-50/20' : ''}`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {invoice.parentFirst ? `${invoice.parentFirst} ${invoice.parentLast || ''}` : 'No asignado'}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {invoice.parentPhone || 'Sin teléfono'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              <User className="h-4 w-4" />
                            </div>
                            <p className="font-medium text-slate-700">
                              {invoice.childFirst ? `${invoice.childFirst} ${invoice.childLast || ''}` : 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{invoice.description || 'Ingreso'}</span>
                            <span className="text-xs text-slate-500 capitalize">{invoice.type || 'General'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center rounded-lg px-3 py-1 font-bold border ${riskColor}`}>
                            ${parseFloat(invoice.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <CalendarDays className={`h-4 w-4 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                              <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                                {dueDateStr ? new Date(dueDateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Sin fecha'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${riskColor}`}>
                                {riskLabel}
                              </span>
                              {isOverdue && (
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                                  {daysDiff} días atraso
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {waLink ? (
                            <a 
                              href={waLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-xl font-bold text-xs transition-colors shadow-sm"
                            >
                              <MessageCircle className="w-4 h-4" /> Notificar
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Sin teléfono</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
