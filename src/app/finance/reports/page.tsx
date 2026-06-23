'use client';

import { useEffect, useState } from 'react';
import { getIncomeStatement } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface StatementItem {
  category: string;
  total: number;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ReportsPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed
  const [incomes, setIncomes] = useState<StatementItem[]>([]);
  const [expenses, setExpenses] = useState<StatementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  async function loadData() {
    setIsLoading(true);
    const month = (selectedMonth + 1).toString().padStart(2, '0');
    const startDate = `${selectedYear}-${month}-01`;
    // Use last day of the month
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const endDate = `${selectedYear}-${month}-${lastDay}`;

    const data = await getIncomeStatement(startDate, endDate);
    setIncomes(data.incomes || []);
    setExpenses(data.expenses || []);
    setIsLoading(false);
  }

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.total), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.total), 0);
  const netIncome = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : '0.0';

  function prevMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  }

  function nextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  }

  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthStr = (selectedMonth + 1).toString().padStart(2, '0');

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Estado de Resultados (ERI)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Análisis de ingresos, gastos y utilidad neta</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month Navigator */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-1 py-1 shadow-sm">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 min-w-[180px] justify-center">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
            </div>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          <Button 
            variant="outline" 
            className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ingresos</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">${totalIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gastos</p>
              <p className="text-xl font-bold text-rose-700 dark:text-rose-400">${totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={`border rounded-xl p-5 shadow-sm ${netIncome >= 0 ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' : 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800'}`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${netIncome >= 0 ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-rose-100 dark:bg-rose-900/50'}`}>
              <DollarSign className={`h-5 w-5 ${netIncome >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Utilidad Neta</p>
              <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-rose-700 dark:text-rose-400'}`}>${netIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ERI Document Card */}
      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
        <CardHeader className="text-center border-b border-slate-100 dark:border-slate-700 pb-6 pt-8">
          <div className="mx-auto bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-3">
            <FileText className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Estado de Resultados Integral</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Periodo del 01/{monthStr}/{selectedYear} al {lastDay}/{monthStr}/{selectedYear}
          </p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Ingresos Section */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-600 pb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-black">1</span>
                  Ingresos Operativos
                </h3>
                <div className="space-y-2">
                  {incomes.map((inc, i) => (
                    <div key={i} className="flex justify-between items-center text-sm py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <span className="text-slate-600 dark:text-slate-300">{inc.category || 'Ingresos Generales'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">${Number(inc.total).toLocaleString()}</span>
                    </div>
                  ))}
                  {incomes.length === 0 && (
                    <div className="text-sm text-slate-400 dark:text-slate-500 pl-4 italic py-3">No hay ingresos registrados en este periodo</div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl mt-3 border border-emerald-100 dark:border-emerald-800">
                    <span>Total de Ingresos</span>
                    <span className="tabular-nums">${totalIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Gastos Section */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-600 pb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-black">2</span>
                  Gastos Operativos
                </h3>
                <div className="space-y-2">
                  {expenses.map((exp, i) => (
                    <div key={i} className="flex justify-between items-center text-sm py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <span className="text-slate-600 dark:text-slate-300">{exp.category || 'Gastos Generales'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">${Number(exp.total).toLocaleString()}</span>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="text-sm text-slate-400 dark:text-slate-500 pl-4 italic py-3">No hay gastos registrados en este periodo</div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 p-4 rounded-xl mt-3 border border-rose-100 dark:border-rose-800">
                    <span>Total de Gastos</span>
                    <span className="tabular-nums">${totalExpense.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-600 my-8"></div>

              {/* Utilidad Neta */}
              <div className={`p-6 rounded-xl border-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                netIncome >= 0 
                  ? 'bg-slate-900 dark:bg-slate-950 border-slate-800 text-white' 
                  : 'bg-rose-50 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
              }`}>
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/20 text-xs font-black">3</span>
                    Utilidad Neta del Periodo
                  </h3>
                  <p className="text-sm opacity-70 mt-1">
                    {netIncome >= 0 ? 'Ganancia' : 'Pérdida'} — Margen: {margin}%
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl font-black tabular-nums">
                  ${netIncome.toLocaleString()}
                </div>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
