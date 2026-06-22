import { createExpense } from '@/lib/actions/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, TrendingDown, DollarSign, Receipt, Tag, Building2, Calendar } from 'lucide-react';

export default function NewExpense() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link href="/finance">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/20">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registrar Egreso</h1>
            <p className="text-sm text-muted-foreground">Ingresa un nuevo gasto operativo de la institución.</p>
          </div>
        </div>
      </div>

      <form action={createExpense} className="space-y-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50 border-b border-rose-100/50 pb-4">
            <div className="flex items-center gap-2 text-rose-800">
              <DollarSign className="h-5 w-5" />
              <CardTitle className="text-lg">Detalles del Egreso</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-rose-600" />
                  Categoría del Gasto <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select name="category" className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 appearance-none shadow-sm" required>
                    <option value="" disabled selected>Seleccione la clasificación contable...</option>
                    
                    <optgroup label="A. Gastos de Operación y Logística">
                      <option value="A. Operación - Alquiler del local">Alquiler del local</option>
                      <option value="A. Operación - Energía eléctrica">Energía eléctrica</option>
                      <option value="A. Operación - Agua potable">Agua potable</option>
                      <option value="A. Operación - Internet">Internet</option>
                      <option value="A. Operación - Teléfono">Teléfono</option>
                      <option value="A. Operación - Reparaciones">Reparaciones</option>
                      <option value="A. Operación - Mantenimiento">Mantenimiento</option>
                      <option value="A. Operación - Licencias de software">Licencias de software</option>
                    </optgroup>

                    <optgroup label="B. Gastos de Personal">
                      <option value="B. Personal - Salarios">Salarios</option>
                      <option value="B. Personal - Beneficios">Beneficios</option>
                      <option value="B. Personal - Seguridad Social">Seguridad Social</option>
                      <option value="B. Personal - Bonificaciones">Bonificaciones</option>
                      <option value="B. Personal - Horas extras">Horas extras</option>
                      <option value="B. Personal - Liquidaciones">Liquidaciones</option>
                    </optgroup>

                    <optgroup label="C. Gastos de Higiene, Salud y Seguridad">
                      <option value="C. Higiene/Salud - Materiales de limpieza">Materiales de limpieza</option>
                      <option value="C. Higiene/Salud - Medicamentos">Medicamentos</option>
                      <option value="C. Higiene/Salud - Botiquín">Botiquín</option>
                      <option value="C. Higiene/Salud - Seguros">Seguros</option>
                      <option value="C. Higiene/Salud - Extintores">Extintores</option>
                      <option value="C. Higiene/Salud - Permisos y licencias">Permisos y licencias</option>
                    </optgroup>

                    <optgroup label="D. Gastos de Ventas y Mercadeo">
                      <option value="D. Ventas - Publicidad digital">Publicidad digital</option>
                      <option value="D. Ventas - Material promocional">Material promocional</option>
                      <option value="D. Ventas - Página web">Página web</option>
                      <option value="D. Ventas - Uniformes">Uniformes</option>
                    </optgroup>

                    <optgroup label="E. Gastos Financieros y Legales">
                      <option value="E. Financieros - Comisiones bancarias">Comisiones bancarias</option>
                      <option value="E. Financieros - Servicios contables">Servicios contables</option>
                      <option value="E. Financieros - Servicios legales">Servicios legales</option>
                    </optgroup>

                    <optgroup label="F. Materiales Gastables">
                      <option value="F. Gastables - Papel higiénico">Papel higiénico</option>
                      <option value="F. Gastables - Jabón">Jabón</option>
                      <option value="F. Gastables - Toallitas húmedas">Toallitas húmedas</option>
                      <option value="F. Gastables - Material educativo">Material educativo</option>
                      <option value="F. Gastables - Agua">Agua</option>
                      <option value="F. Gastables - Meriendas">Meriendas</option>
                    </optgroup>

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
                  <Input type="number" step="0.01" min="0" name="amount" required className="pl-7 h-11 rounded-xl shadow-sm text-lg font-bold text-rose-700" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-rose-600" />
                  Fecha de la Factura <span className="text-red-500">*</span>
                </Label>
                <Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="h-11 rounded-xl shadow-sm" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Descripción del Gasto <span className="text-red-500">*</span></Label>
                <Input name="description" required className="h-11 rounded-xl shadow-sm" placeholder="Ej. Compra de insumos semanales de limpieza..." />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-rose-600" />
                  Nombre del Proveedor <span className="text-red-500">*</span>
                </Label>
                <Input name="vendor" required className="h-11 rounded-xl shadow-sm" placeholder="Ej. Supermercado Nacional" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-rose-600" />
                  No. de Factura / Comprobante (NCF)
                </Label>
                <Input name="reference" className="h-11 rounded-xl shadow-sm" placeholder="Ej. B0100000005" />
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
            className="h-11 gap-2 rounded-xl px-8 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg shadow-rose-500/25 transition-all duration-300 font-semibold"
          >
            <DollarSign className="h-5 w-5" />
            Guardar Egreso
          </Button>
        </div>
      </form>
    </div>
  );
}
