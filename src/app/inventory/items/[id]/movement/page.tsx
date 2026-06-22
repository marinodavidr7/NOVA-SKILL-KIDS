import { getInventoryItemById, recordInventoryMovement } from '@/lib/actions/inventory';
import { getAccounts } from '@/lib/actions/finance-erp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

export default async function MovementPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ type: string }> }) {
  const { id } = await params;
  const { type: searchType } = await searchParams;
  const item = await getInventoryItemById(id);
  const accounts = await getAccounts();
  const type = searchType === 'out' ? 'out' : 'in';

  if (!item) {
    return <div className="p-8 text-center text-slate-500">Producto no encontrado</div>;
  }

  // Wrapper function to bind the action parameters
  async function actionWithData(formData: FormData) {
    'use server';
    
    let receiptUrl = undefined;
    const file = formData.get('receipt') as File;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
      
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        receiptUrl = `/uploads/receipts/${filename}`;
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }

    await recordInventoryMovement({
      inventoryId: id,
      type,
      quantity: parseInt(formData.get('quantity') as string),
      notes: formData.get('notes') as string,
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : 0,
      accountId: formData.get('accountId') as string || undefined,
      receiptUrl
    });
    redirect(`/inventory/items/${id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {type === 'in' ? <ArrowDownToLine className="h-6 w-6" /> : <ArrowUpFromLine className="h-6 w-6" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Registrar {type === 'in' ? 'Entrada' : 'Salida'}</h2>
          <p className="text-sm text-slate-500">Producto: <span className="font-semibold text-slate-700">{item.name}</span> (Actual: {item.quantity} {item.unit})</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={actionWithData} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cantidad a {type === 'in' ? 'Sumar' : 'Restar'} ({item.unit})</Label>
                <Input type="number" name="quantity" required min="1" defaultValue={1} />
              </div>
              <div className="space-y-2">
                <Label>Motivo / Persona que recibe</Label>
                <Input name="notes" placeholder={type === 'in' ? 'Ej. Compra de inicio de mes' : 'Ej. Entregado a Miss Laura (Aula 2)'} required />
              </div>
            </div>

            {type === 'in' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">Información Contable (Opcional)</h3>
                <p className="text-xs text-slate-500 -mt-2">Si compraste esto con dinero de Nova Skill Kids, regístralo aquí para descontarlo del banco.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Costo de Compra Total ($)</Label>
                    <Input type="number" step="0.01" name="cost" defaultValue={0} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cuenta de Pago</Label>
                    <select name="accountId" className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm">
                      <option value="">-- No descontar de caja --</option>
                      {accounts.map(acc => (
                         <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-slate-200 pt-4 mt-2">
                  <Label>Adjuntar Factura o Recibo (Opcional)</Label>
                  <Input type="file" name="receipt" accept="image/*,.pdf" className="bg-white" />
                  <p className="text-[10px] text-slate-500">Puedes subir fotos (.jpg, .png) o documentos (.pdf).</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Link href={`/inventory/items/${item.id}`}><Button variant="outline" type="button">Cancelar</Button></Link>
              <Button type="submit" className={type === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}>
                Confirmar {type === 'in' ? 'Entrada' : 'Salida'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
