'use client';

import { useEffect, useState } from 'react';
import { getInventory, getAssets, getInventorySummary, getInventoryMovements } from '@/lib/actions/inventory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, PlusCircle, Paperclip } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const [tab, setTab] = useState('inventory');
  const [inventory, setInventory] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalItems: 0, lowStock: 0, totalAssets: 0, assetsValue: 0 });

  useEffect(() => {
    getInventory().then(setInventory);
    getAssets().then(setAssets);
    getInventorySummary().then(setSummary);
    getInventoryMovements().then(setMovements);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventario y Activos</h1>
          </div>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-xl">
          <button onClick={() => setTab('inventory')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'inventory' ? 'bg-white shadow-sm text-cyan-600' : 'text-muted-foreground hover:text-foreground'}`}>Inventario</button>
          <button onClick={() => setTab('assets')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'assets' ? 'bg-white shadow-sm text-cyan-600' : 'text-muted-foreground hover:text-foreground'}`}>Activos Fijos</button>
          <button onClick={() => setTab('movements')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'movements' ? 'bg-white shadow-sm text-cyan-600' : 'text-muted-foreground hover:text-foreground'}`}>Movimientos</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="py-4"><p className="text-sm text-muted-foreground">Total Artículos</p><p className="text-2xl font-bold">{summary.totalItems}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-sm text-red-600">Stock Bajo</p><p className="text-2xl font-bold text-red-700">{summary.lowStock}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-sm text-muted-foreground">Total Activos</p><p className="text-2xl font-bold">{summary.totalAssets}</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-sm text-blue-600">Valor Activos</p><p className="text-2xl font-bold">${summary.assetsValue?.toLocaleString()}</p></CardContent></Card>
      </div>

      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href="/inventory/items/new"><Button className="bg-cyan-600 hover:bg-cyan-700"><PlusCircle className="w-4 h-4 mr-2"/> Nuevo Artículo</Button></Link>
          </div>
          <Card className="border-0 shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Categoría</TableHead><TableHead>Cantidad</TableHead><TableHead>Ubicación</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {inventory.map(item => (
                  <TableRow key={item.id} className="cursor-pointer group relative">
                    <TableCell className="font-medium">
                      <Link href={`/inventory/items/${item.id}`} className="absolute inset-0 z-10"></Link>
                      <span className="relative z-20 group-hover:text-cyan-600 transition-colors">{item.name}</span>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      {item.quantity <= item.minStock ? 
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Stock Bajo</span> : 
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Normal</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {tab === 'assets' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href="/inventory/assets/new"><Button className="bg-blue-600 hover:bg-blue-700"><PlusCircle className="w-4 h-4 mr-2"/> Nuevo Activo</Button></Link>
          </div>
          <Card className="border-0 shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Categoría</TableHead><TableHead>Valor</TableHead><TableHead>No. Serie</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {assets.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>${a.purchaseValue?.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{a.serialNumber}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${a.status === 'active' ? 'bg-green-100 text-green-700' : a.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {a.status === 'active' ? 'Activo' : a.status === 'maintenance' ? 'En Mantenimiento' : 'Retirado'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {tab === 'movements' && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Tipo</TableHead><TableHead>Artículo</TableHead><TableHead>Cantidad</TableHead><TableHead>Motivo / Cuenta</TableHead></TableRow></TableHeader>
              <TableBody>
                {movements.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {new Date(m.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell>
                      {m.type === 'in' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-xs border border-emerald-100">
                          Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full text-xs border border-rose-100">
                          Salida
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{m.itemName}</TableCell>
                    <TableCell className={`font-bold ${m.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.type === 'in' ? '+' : '-'}{m.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium text-slate-700">{m.notes}</span>
                          {m.accountName && <div className="text-[10px] text-slate-400 mt-0.5">Vía: {m.accountName}</div>}
                        </div>
                        {m.receiptUrl && (
                          <a href={m.receiptUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-medium transition-colors">
                            <Paperclip className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No hay movimientos registrados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
