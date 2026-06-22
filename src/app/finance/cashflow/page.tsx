"use client";

import React, { useState, useEffect } from 'react';
import { getCashflow } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownRight, ArrowUpRight, LineChart, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function CashflowPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default dates: first and last day of current month
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  // Calculate last day of current month
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

  const [startDate, setStartDate] = useState(`${year}-${month}-01`);
  const [endDate, setEndDate] = useState(`${year}-${month}-${lastDay}`);

  const loadCashflow = async (start: string, end: string) => {
    setIsLoading(true);
    try {
      const data = await getCashflow(start, end);
      setTransactions(data);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar flujo de caja');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCashflow(startDate, endDate);
  }, [startDate, endDate]);

  const exportToExcel = () => {
    if (transactions.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    try {
      const data = transactions.map(t => ({
        "Fecha": formatDate(t.date),
        "Descripción": t.description,
        "Referencia": t.reference || "N/A",
        "Cuenta": t.accountName,
        "Categoría": t.category || "General",
        "Tipo": t.type === 'in' ? "Entrada" : t.type === 'out' ? "Salida" : "Transferencia",
        "Monto": t.amount
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Flujo de Caja");

      // Auto-size columns
      const colWidths = [
        { wch: 15 }, // Fecha
        { wch: 35 }, // Descripción
        { wch: 15 }, // Referencia
        { wch: 20 }, // Cuenta
        { wch: 18 }, // Categoría
        { wch: 15 }, // Tipo
        { wch: 15 }  // Monto
      ];
      worksheet["!cols"] = colWidths;

      XLSX.writeFile(workbook, `flujo_caja_${startDate}_a_${endDate}.xlsx`);
      toast.success("Archivo Excel exportado con éxito");
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar archivo Excel");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      if (dateStr.includes('-') && !dateStr.includes('T')) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      }
      return new Date(dateStr).toLocaleDateString('es-ES');
    } catch (e) {
      return dateStr;
    }
  };

  const totalIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalIn - totalOut;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Flujo de Caja</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Historial completo de entradas y salidas de dinero</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 px-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Desde:</span>
            <Input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="h-8 text-xs border-0 bg-transparent focus-visible:ring-0 p-0 w-28 text-slate-700 dark:text-slate-300"
            />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Hasta:</span>
            <Input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="h-8 text-xs border-0 bg-transparent focus-visible:ring-0 p-0 w-28 text-slate-700 dark:text-slate-300"
            />
          </div>
          <Button 
            onClick={exportToExcel}
            variant="outline" 
            className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" /> Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalIn.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4" /> Salidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">${totalOut.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-sm relative overflow-hidden ${netFlow >= 0 ? 'bg-slate-900 dark:bg-slate-950' : 'bg-rose-900 dark:bg-rose-950'} text-white`}>
          <div className="absolute top-0 right-0 p-4 opacity-10"><LineChart className="w-24 h-24" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Flujo Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">${netFlow.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm mt-8 bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Transacciones del Periodo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Cuenta</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{t.description}</div>
                      {t.reference && <div className="text-xs text-slate-400 dark:text-slate-500">Ref: {t.reference}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {t.accountName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t.category || 'General'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'in' ? 'text-emerald-600' : t.type === 'out' ? 'text-rose-600' : 'text-blue-600'}`}>
                      {t.type === 'in' ? '+' : t.type === 'out' ? '-' : ''}${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                
                {transactions.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No hay transacciones en este periodo.
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
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
