import { createInventoryItem } from '@/lib/actions/inventory';
import { getAccounts } from '@/lib/actions/finance-erp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewInventoryItem() {
  const accounts = await getAccounts();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Nuevo Artículo de Inventario</h2>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form action={createInventoryItem} className="space-y-4">
            <div className="space-y-2"><Label>Nombre del Artículo</Label><Input name="name" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select name="category" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
                  <option value="Material Educativo">Material Educativo</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Medicamentos">Medicamentos</option>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Juguetes">Juguetes</option>
                  <option value="Equipos">Equipos</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Unidad de Medida</Label>
                <select name="unit" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
                  <option value="unidad">Unidad</option>
                  <option value="caja">Caja</option>
                  <option value="paquete">Paquete</option>
                  <option value="litro">Litro</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cantidad Inicial</Label><Input type="number" name="quantity" required defaultValue={0} /></div>
              <div className="space-y-2"><Label>Stock Mínimo (Alerta)</Label><Input type="number" name="minStock" required defaultValue={5} /></div>
            </div>
            <div className="space-y-2"><Label>Ubicación</Label><Input name="location" placeholder="Ej: Armario 2, Aula A..." /></div>
            
            <div className="pt-4 mt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Información Contable (Opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Costo Total de la Compra ($)</Label>
                  <Input type="number" step="0.01" name="cost" defaultValue={0} placeholder="Ej. 1500.00" />
                  <p className="text-[10px] text-slate-500">Deja en 0 si es saldo inicial sin costo actual.</p>
                </div>
                <div className="space-y-2">
                  <Label>Cuenta de Pago</Label>
                  <select name="accountId" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                    <option value="">-- No descontar de caja --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2 pt-2">
                  <Label>Adjuntar Factura o Recibo (Opcional)</Label>
                  <Input type="file" name="receipt" accept="image/*,.pdf" className="bg-white" />
                  <p className="text-[10px] text-slate-500">Puedes subir fotos (.jpg, .png) o documentos (.pdf).</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Link href="/inventory"><Button variant="outline" type="button">Cancelar</Button></Link>
              <Button type="submit">Guardar Artículo</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
