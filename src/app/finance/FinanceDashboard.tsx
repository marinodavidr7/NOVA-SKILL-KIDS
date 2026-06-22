'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Landmark, ArrowRightLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function FinanceDashboard({ 
  summary,
  recentTransactions,
  expensesByCategory,
  accounts,
  tuitionStatus,
  currentPeriod
}: { 
  summary: any,
  recentTransactions: any[],
  expensesByCategory: any[],
  accounts: any[],
  tuitionStatus?: any[],
  currentPeriod?: string
}) {
  
  const totalBank = accounts.filter(a => a.type === 'bank').reduce((sum, a) => sum + a.balance, 0);
  const totalCash = accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.balance, 0);
  const totalLiquidity = totalBank + totalCash;
  const maxExpense = Math.max(...expensesByCategory.map(e => e.total), 1);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-24 h-24" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ingresos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">${summary.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" /> Todo lo cobrado este mes
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Egresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600">${summary.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-rose-500" /> Nómina, inventario y más
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Balance del Periodo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black ${summary.netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              ${summary.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Flujo de caja actual del mes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Liquidity Widget */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden relative">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
              <Landmark className="w-48 h-48" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Liquidez Disponible (Cuentas Activas)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-6">${totalLiquidity.toLocaleString()}</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-slate-300 text-sm mb-1 flex items-center gap-2">
                    <Landmark className="h-4 w-4" /> En Bancos
                  </div>
                  <div className="text-2xl font-bold text-white">${totalBank.toLocaleString()}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-slate-300 text-sm mb-1 flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> En Efectivo
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">${totalCash.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Transacciones Recientes</CardTitle>
              <Link href="/finance/accounts" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Ver todas</Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No hay transacciones recientes.</div>
                ) : (
                  recentTransactions.map((tx: any) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === 'in' ? 'bg-emerald-100 text-emerald-600' :
                          tx.type === 'out' ? 'bg-rose-100 text-rose-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {tx.type === 'in' ? <ArrowDownRight className="h-5 w-5" /> :
                           tx.type === 'out' ? <ArrowUpRight className="h-5 w-5" /> :
                           <ArrowRightLeft className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{tx.description}</p>
                          <div className="flex gap-2 items-center text-xs text-slate-500">
                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{tx.accountName || 'Cuenta Eliminada'}</span>
                            {tx.category && (
                              <>
                                <span>•</span>
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{tx.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold shrink-0 ${
                        tx.type === 'in' ? 'text-emerald-600' :
                        tx.type === 'out' ? 'text-rose-600' :
                        'text-blue-600'
                      }`}>
                        {tx.type === 'in' ? '+' : tx.type === 'out' ? '-' : ''}${tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Gastos por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {expensesByCategory.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No hay gastos registrados este mes.</div>
              ) : (
                <div className="space-y-6">
                  {expensesByCategory.map((exp: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700">{exp.category}</span>
                        <span className="font-bold text-slate-900">${exp.total.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-rose-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${(exp.total / maxExpense) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
