'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Receipt, TrendingDown, X, Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { registerExpense, attachExpenseReceipt } from '@/lib/actions/finance-erp';
import ReceiptModal from '@/components/ReceiptModal';

export default function ExpensesManager({
  expenses,
  accounts,
  totalExpenses
}: {
  expenses: any[],
  accounts: any[],
  totalExpenses: number
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleExpenseSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await registerExpense(formData);
      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gastos y Egresos</h2>
          <p className="text-sm text-slate-500">Registro de pagos, compras y facturas de la institución</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
        >
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? 'Cancelar' : 'Registrar Gasto'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-rose-50 border-t-4 border-rose-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Total de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-rose-500 mt-1">{expenses.length} registros</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border border-rose-200 shadow-sm animate-in slide-in-from-top-4">
          <CardHeader className="bg-rose-50/50 pb-4">
            <CardTitle className="text-lg text-rose-800">Registrar Nuevo Gasto</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form action={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monto ($)</Label>
                  <Input type="number" step="0.01" name="amount" required placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input name="description" required placeholder="Ej. Pago de luz eléctrica" />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <select name="category" className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                    <option value="Servicios Básicos">Servicios Básicos</option>
                    <option value="Internet">Internet</option>
                    <option value="Alquiler">Alquiler</option>
                    <option value="Activos Fijos">Activos Fijos</option>
                    <option value="Nómina">Nómina</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Inventario">Compras / Inventario</option>
                    <option value="Impuestos">Impuestos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Cuenta de Pago</Label>
                  <select name="accountId" className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (${a.balance})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Proveedor (Opcional)</Label>
                  <Input name="vendor" placeholder="Nombre del comercio o persona" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Adjuntar Factura o Recibo (Opcional)</Label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Paperclip className="h-5 w-5 text-slate-500" />
                    </div>
                    <Input type="file" name="receipt" accept="image/*,.pdf" className="bg-white flex-1" />
                  </div>
                  <p className="text-[10px] text-slate-500">Puedes subir fotos (.jpg, .png) o documentos (.pdf).</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirmar Gasto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm mt-8">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Historial de Gastos</CardTitle>
          <div className="flex gap-2">
            <Input type="month" className="h-9 text-sm" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Cuenta</th>
                  <th className="px-6 py-4 font-bold text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Factura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {new Date(expense.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{expense.description}</div>
                      {expense.vendor && <div className="text-xs text-slate-400">Proveedor: {expense.vendor}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {expense.accountName || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">
                      ${expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {expense.receiptUrl ? (
                        <ReceiptModal url={expense.receiptUrl} type="icon" />
                      ) : (
                        <div className="relative group">
                          <Label htmlFor={`upload-${expense.id}`} className="cursor-pointer">
                            <span className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 justify-center bg-slate-50 hover:bg-rose-50 px-2 py-1 rounded transition-colors border border-dashed border-slate-200 hover:border-rose-200">
                              <Plus className="h-3 w-3" /> Subir
                            </span>
                          </Label>
                          <form action={async (formData) => {
                            await attachExpenseReceipt(expense.id, formData);
                          }}>
                            <Input 
                              type="file" 
                              id={`upload-${expense.id}`} 
                              name="receipt" 
                              accept="image/*,.pdf" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.form) {
                                  e.target.form.requestSubmit();
                                }
                              }}
                            />
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No hay gastos registrados en este periodo.
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
