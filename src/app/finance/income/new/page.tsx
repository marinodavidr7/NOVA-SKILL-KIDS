import { createIncome } from '@/lib/actions/finance';
import { getChildren } from '@/lib/actions/children';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, DollarSign, Receipt, CreditCard, User, Calendar } from 'lucide-react';

export default async function NewIncome() {
  const childrenList = await getChildren();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link href="/finance">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registrar Ingreso</h1>
            <p className="text-sm text-muted-foreground">Ingresa un nuevo pago, mensualidad o donación al sistema.</p>
          </div>
        </div>
      </div>

      <form action={createIncome} className="space-y-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50 pb-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <DollarSign className="h-5 w-5" />
              <CardTitle className="text-lg">Detalles del Ingreso</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-600" />
                  Tipo de Ingreso <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select name="type" className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none shadow-sm" required>
                    <option value="" disabled selected>Seleccione el tipo...</option>
                    <option value="Matrícula">Matrícula</option>
                    <option value="Mensualidad">Mensualidad</option>
                    <option value="Actividades especiales">Actividades especiales</option>
                    <option value="Donaciones">Donaciones</option>
                    <option value="Otros ingresos">Otros ingresos</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Monto (RD$) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">$</span>
                  </div>
                  <Input type="number" step="0.01" min="0" name="amount" required className="pl-7 h-11 rounded-xl shadow-sm text-lg font-bold text-emerald-700" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Fecha del Pago <span className="text-red-500">*</span>
                </Label>
                <Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="h-11 rounded-xl shadow-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  Método de Pago <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select name="paymentMethod" className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none shadow-sm" required>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Descripción del Pago <span className="text-red-500">*</span></Label>
                <Input name="description" required className="h-11 rounded-xl shadow-sm" placeholder="Ej. Pago correspondiente al mes de Octubre..." />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Número de Referencia / Comprobante</Label>
                <Input name="reference" className="h-11 rounded-xl shadow-sm" placeholder="Opcional" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  Vincular a Niño/a (Opcional)
                </Label>
                <div className="relative">
                  <select name="childId" className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none shadow-sm">
                    <option value="">-- No vincular a ningún estudiante --</option>
                    {childrenList.map((child: any) => (
                      <option key={child.id} value={child.id}>
                        {child.firstName} {child.lastName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/finance">
            <Button type="button" variant="outline" className="rounded-xl px-6 h-11 border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</Button>
          </Link>
          <Button 
            type="submit" 
            className="h-11 gap-2 rounded-xl px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 font-semibold"
          >
            <DollarSign className="h-5 w-5" />
            Guardar Ingreso
          </Button>
        </div>
      </form>
    </div>
  );
}
