import { createAsset } from '@/lib/actions/inventory';
import { getAccounts } from '@/lib/actions/finance-erp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default async function NewAsset() {
  const accounts = await getAccounts();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Nuevo Activo Fijo</h2>
      <Card>
        <CardContent className="pt-6">
          <form action={createAsset} className="space-y-4">
            <div className="space-y-2"><Label>Nombre del Activo</Label><Input name="name" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select name="category" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
                  <option value="Electrónica">Electrónica</option>
                  <option value="Mobiliario">Mobiliario</option>
                  <option value="Equipo Educativo">Equipo Educativo</option>
                  <option value="Cocina">Cocina</option>
                  <option value="Seguridad">Seguridad</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <select name="status" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
                  <option value="active">Activo</option>
                  <option value="maintenance">En Mantenimiento</option>
                  <option value="retired">Retirado</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Información de Compra y Contabilidad</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Fecha de Compra</Label><Input type="date" name="purchaseDate" /></div>
                <div className="space-y-2"><Label>Valor de Compra ($)</Label><Input type="number" step="0.01" name="purchaseValue" defaultValue={0} /></div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Cuenta de Pago (De donde salió el dinero)</Label>
                <select name="accountId" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="">-- Ya pagado / Saldo Inicial (no descontar) --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2"><Label>Ubicación</Label><Input name="location" /></div>
              <div className="space-y-2"><Label>Número de Serie (Opcional)</Label><Input name="serialNumber" /></div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Link href="/inventory"><Button variant="outline" type="button">Cancelar</Button></Link>
              <Button type="submit">Guardar Activo</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
