import { getReceivables } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Search, Send, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default async function ReceivablesPage() {
  const receivables = await getReceivables();
  
  const totalDue = receivables.reduce((sum, r) => sum + r.amount, 0);
  const now = new Date();

  const getDaysLate = (dueDate: string) => {
    if (!dueDate) return 0;
    const diff = now.getTime() - new Date(dueDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  };

  const overdue = receivables.filter(r => getDaysLate(r.dueDate) > 0);
  const totalOverdue = overdue.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cuentas por Cobrar</h2>
          <p className="text-sm text-slate-500">Gestión de deudas, morosidad y recordatorios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-rose-50 border-t-4 border-rose-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Total Vencido (Morosidad)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600">${totalOverdue.toLocaleString()}</div>
            <p className="text-xs text-rose-500 mt-1">{overdue.length} facturas vencidas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Total por Cobrar (Vencido + Vigente)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">${totalDue.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">{receivables.length} facturas pendientes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm mt-8">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Lista de Deudores</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input type="text" placeholder="Buscar por alumno..." className="pl-9 h-9 text-sm rounded-lg" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Alumno</th>
                  <th className="px-6 py-4">Concepto</th>
                  <th className="px-6 py-4">Vencimiento</th>
                  <th className="px-6 py-4">Días de Atraso</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receivables.map(r => {
                  const daysLate = getDaysLate(r.dueDate);
                  const isLate = daysLate > 0;
                  
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-slate-800">{r.firstName} {r.lastName}</div>
                          <div className="text-xs text-slate-400 font-mono">{r.parentPhone || 'Sin teléfono'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{r.type}</div>
                        <div className="text-xs text-slate-400">{r.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        {r.dueDate ? new Date(r.dueDate).toLocaleDateString('es-ES') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {isLate ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {daysLate} días
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Vigente</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        ${r.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Recordatorio
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                
                {receivables.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No hay cuentas por cobrar pendientes. ¡Excelente!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
