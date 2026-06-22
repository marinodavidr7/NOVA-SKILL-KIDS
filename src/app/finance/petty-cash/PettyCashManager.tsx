'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, Plus, ArrowDownToLine, ArrowUpFromLine, Receipt, X } from 'lucide-react';
import { recordPettyCashTransaction } from '@/lib/actions/finance-erp';
import { useRouter } from 'next/navigation';

export default function PettyCashManager({
  pettyCash,
  transactions
}: {
  pettyCash: any;
  transactions: any[];
}) {
  const router = useRouter();
  
  // States to toggle forms
  const [showReplenishForm, setShowReplenishForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent, type: 'replenish' | 'expense') => {
    e.preventDefault();
    if (!pettyCash || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await recordPettyCashTransaction({
        pettyCashId: pettyCash.id,
        type,
        amount: parseFloat(amount),
        description,
        date
      });
      
      if (res.success) {
        setShowReplenishForm(false);
        setShowExpenseForm(false);
        setAmount('');
        setDescription('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Caja Chica</h2>
          <p className="text-sm text-slate-500">Manejo de efectivo para gastos menores diarios</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setShowReplenishForm(!showReplenishForm);
              setShowExpenseForm(false);
            }}
            variant="outline" 
            className="text-slate-600 bg-white shadow-sm border-slate-200"
          >
            {showReplenishForm ? <X className="h-4 w-4 mr-2" /> : <ArrowDownToLine className="h-4 w-4 mr-2" />}
            {showReplenishForm ? 'Cancelar' : 'Reembolsar'}
          </Button>
          <Button 
            onClick={() => {
              setShowExpenseForm(!showExpenseForm);
              setShowReplenishForm(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {showExpenseForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showExpenseForm ? 'Cancelar' : 'Registrar Gasto'}
          </Button>
        </div>
      </div>

      {(showReplenishForm || showExpenseForm) && (
        <Card className={`border-0 shadow-sm border-t-4 ${showReplenishForm ? 'border-t-blue-500' : 'border-t-rose-500'}`}>
          <CardHeader className="pb-3 bg-slate-50">
            <CardTitle className="text-lg">
              {showReplenishForm ? 'Registrar Reembolso a Caja Chica' : 'Registrar Gasto de Caja Chica'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={(e) => handleSubmit(e, showReplenishForm ? 'replenish' : 'expense')} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Monto (RD$)</Label>
                  <Input type="number" step="0.01" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder={showReplenishForm ? "Ej. Reposición semanal" : "Ej. Compra de agua"} required />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className={showReplenishForm ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {pettyCash && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10"><PiggyBank className="w-24 h-24" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100 flex items-center justify-between">
                <span>Fondo Disponible</span>
                <span className="bg-emerald-800/50 px-2 py-0.5 rounded text-xs">Fijo: ${pettyCash.cashLimit.toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">${pettyCash.balance.toLocaleString()}</div>
              
              <div className="mt-6 space-y-1">
                <div className="flex justify-between text-xs font-medium text-emerald-100">
                  <span>Consumido: ${(pettyCash.cashLimit - pettyCash.balance).toLocaleString()}</span>
                  <span>{Math.round(((pettyCash.cashLimit - pettyCash.balance) / pettyCash.cashLimit) * 100)}%</span>
                </div>
                <div className="w-full bg-emerald-900/40 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full" 
                    style={{ width: `${Math.min(100, ((pettyCash.cashLimit - pettyCash.balance) / pettyCash.cashLimit) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-0 shadow-sm mt-8">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">Movimientos de Caja Chica</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {new Date(t.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      {t.type === 'expense' ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                          <ArrowUpFromLine className="h-3.5 w-3.5" /> Salida
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <ArrowDownToLine className="h-3.5 w-3.5" /> Reembolso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {t.description}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {t.receiptUrl ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No hay movimientos registrados.
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
