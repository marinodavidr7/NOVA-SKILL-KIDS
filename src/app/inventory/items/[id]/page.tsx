import { getInventoryItemById, getInventoryMovements, updateInventoryItem, deleteInventoryItem } from '@/lib/actions/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Save, Trash2, AlertTriangle, Paperclip } from 'lucide-react';
import Link from 'next/link';
import ReceiptModal from '@/components/ReceiptModal';

export default async function InventoryItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getInventoryItemById(id);
  const movements = await getInventoryMovements(id);

  if (!item) {
    return <div className="p-8 text-center text-slate-500">Producto no encontrado</div>;
  }

  const isLowStock = item.quantity <= item.minStock;

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon" className="h-9 w-9 bg-white shadow-sm border border-slate-200"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{item.name}</h2>
          <p className="text-sm text-slate-500">Detalles y movimientos del producto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className={`border-0 shadow-sm relative overflow-hidden ${isLowStock ? 'bg-red-50 border-t-4 border-red-500' : 'bg-cyan-50 border-t-4 border-cyan-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${isLowStock ? 'text-red-700' : 'text-cyan-700'}`}>Stock Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-5xl font-black ${isLowStock ? 'text-red-600' : 'text-cyan-600'}`}>
                {item.quantity} <span className="text-lg font-medium opacity-70">{item.unit}</span>
              </div>
              {isLowStock && (
                <div className="mt-2 flex items-center text-xs text-red-600 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Por debajo del mínimo ({item.minStock})
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Link href={`/inventory/items/${item.id}/movement?type=in`} className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex justify-start h-12">
                  <div className="bg-white/20 p-1.5 rounded mr-3"><ArrowDownToLine className="h-4 w-4" /></div>
                  <div className="text-left leading-tight">
                    <div className="font-semibold text-sm">Registrar Entrada</div>
                    <div className="text-[10px] text-emerald-100 font-normal">Reabastecer stock</div>
                  </div>
                </Button>
              </Link>
              <Link href={`/inventory/items/${item.id}/movement?type=out`} className="block">
                <Button variant="outline" className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 flex justify-start h-12">
                  <div className="bg-rose-100 p-1.5 rounded mr-3"><ArrowUpFromLine className="h-4 w-4" /></div>
                  <div className="text-left leading-tight">
                    <div className="font-semibold text-sm">Registrar Salida</div>
                    <div className="text-[10px] text-rose-500 font-normal">Consumo de material</div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Editar Información</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form id="update-form" action={updateInventoryItem} className="space-y-4">
                <input type="hidden" name="id" value={item.id} />
                <div className="space-y-2"><Label>Nombre del Artículo</Label><Input name="name" defaultValue={item.name} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <select name="category" defaultValue={item.category} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
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
                    <select name="unit" defaultValue={item.unit} className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" required>
                      <option value="unidad">Unidad</option>
                      <option value="caja">Caja</option>
                      <option value="paquete">Paquete</option>
                      <option value="litro">Litro</option>
                      <option value="kg">Kg</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Stock Mínimo (Alerta)</Label><Input type="number" name="minStock" required defaultValue={item.minStock} /></div>
                  <div className="space-y-2"><Label>Ubicación</Label><Input name="location" defaultValue={item.location} /></div>
                </div>
                {!item.receiptUrl && (
                  <div className="space-y-2 pt-2 border-t mt-4 border-slate-100">
                    <Label className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-slate-500" />Adjuntar Factura Principal (Opcional)</Label>
                    <Input type="file" name="receipt" accept="image/*,.pdf" className="bg-white" />
                    <p className="text-[10px] text-slate-500">Solo se puede subir si no tiene una factura principal registrada.</p>
                  </div>
                )}
                {item.receiptUrl && (
                  <div className="pt-2">
                    <ReceiptModal url={item.receiptUrl} type="button" />
                  </div>
                )}
              </form>

              <div className="flex justify-between items-center pt-4 border-t mt-6">
                <form action={deleteInventoryItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 px-3 text-xs">
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar Producto
                  </Button>
                </form>
                <Button type="submit" form="update-form" className="bg-slate-800 hover:bg-slate-900 text-white">
                  <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Historial Específico</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Cantidad</th>
                      <th className="px-6 py-3">Motivo / Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-slate-500">
                          {new Date(m.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-3">
                          {m.type === 'in' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-xs border border-emerald-100">
                              <ArrowDownToLine className="h-3 w-3" /> Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full text-xs border border-rose-100">
                              <ArrowUpFromLine className="h-3 w-3" /> Salida
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-3 font-bold ${m.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {m.type === 'in' ? '+' : '-'}{m.quantity}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-medium text-slate-700">{m.notes}</span>
                              {m.accountId && <div className="text-[10px] text-slate-400 mt-0.5">Pagado con: {m.accountName}</div>}
                            </div>
                            {m.receiptUrl && (
                              <ReceiptModal url={m.receiptUrl} type="link" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {movements.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic text-sm">
                          No hay movimientos registrados para este producto.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
