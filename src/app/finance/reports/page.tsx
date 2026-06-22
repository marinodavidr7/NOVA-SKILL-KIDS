import { getIncomeStatement } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PrintERIButton from '@/components/finance/PrintERIButton';

export default async function ReportsPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  // By default, current month
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`; 

  const { incomes, expenses } = await getIncomeStatement(startDate, endDate);
  
  const totalIncome = incomes.reduce((sum, i) => sum + i.total, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.total, 0);
  const netIncome = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Estados Financieros</h2>
          <p className="text-sm text-slate-500">Estado de Resultados y Rentabilidad</p>
        </div>
        <div className="flex gap-2">
          <Input type="month" defaultValue={`${year}-${month}`} className="w-40" />
          <PrintERIButton />
        </div>
      </div>

      <Card className="border border-slate-200 shadow-sm mt-8 bg-white">
        <CardHeader className="text-center border-b border-slate-100 pb-6 pt-8">
          <div className="mx-auto bg-emerald-100 text-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Estado de Resultados (ERI)</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Periodo del 01/{month}/{year} al 31/{month}/{year}</p>
        </CardHeader>
        <CardContent className="p-8">
          
          {/* Ingresos Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">1. Ingresos Operativos</h3>
            <div className="space-y-3">
              {incomes.map((inc, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600 pl-4">{inc.category || 'Ingresos Generales'}</span>
                  <span className="font-medium text-slate-800">${inc.total.toLocaleString()}</span>
                </div>
              ))}
              {incomes.length === 0 && (
                <div className="text-sm text-slate-400 pl-4 italic">No hay ingresos registrados</div>
              )}
              <div className="flex justify-between text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-lg mt-2">
                <span>Total de Ingresos</span>
                <span>${totalIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Gastos Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">2. Gastos Operativos</h3>
            <div className="space-y-3">
              {expenses.map((exp, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600 pl-4">{exp.category || 'Gastos Generales'}</span>
                  <span className="font-medium text-slate-800">${exp.total.toLocaleString()}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-sm text-slate-400 pl-4 italic">No hay gastos registrados</div>
              )}
              <div className="flex justify-between text-sm font-bold text-rose-700 bg-rose-50 p-3 rounded-lg mt-2">
                <span>Total de Gastos</span>
                <span>${totalExpense.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Utilidad Neta */}
          <div className={`mt-10 p-6 rounded-xl border-2 flex justify-between items-center ${netIncome >= 0 ? 'bg-slate-900 border-slate-800 text-white' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
            <div>
              <h3 className="text-xl font-bold">Utilidad Neta</h3>
              <p className={`text-sm opacity-80 mt-1`}>
                {netIncome >= 0 ? 'Ganancia del periodo' : 'Pérdida del periodo'}
              </p>
            </div>
            <div className="text-4xl font-black">
              ${netIncome.toLocaleString()}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
