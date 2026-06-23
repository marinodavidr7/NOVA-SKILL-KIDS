'use client';

import { useEffect, useState } from 'react';
import { getInventory, getAssets, getInventorySummary, getInventoryMovements } from '@/lib/actions/inventory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, PlusCircle, Paperclip, AlertTriangle, Briefcase, DollarSign, ArrowRightLeft } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in p-2 md:p-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">Inventario y Activos</h1>
            <p className="text-sm text-slate-500 mt-1">Gestiona los recursos y el patrimonio</p>
          </div>
        </div>
        <div className="flex bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 rounded-full shadow-inner border border-slate-200/50 dark:border-slate-700/50">
          <button onClick={() => setTab('inventory')} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === 'inventory' ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Inventario</button>
          <button onClick={() => setTab('assets')} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === 'assets' ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Activos Fijos</button>
          <button onClick={() => setTab('movements')} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${tab === 'movements' ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Movimientos</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Artículos</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{summary.totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Stock Bajo</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{summary.lowStock}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Activos</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{summary.totalAssets}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Valor Activos</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">${summary.assetsValue?.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {tab === 'inventory' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end">
            <Link href="/inventory/items/new">
              <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-md shadow-cyan-500/20 rounded-full px-6 transition-all hover:scale-105">
                <PlusCircle className="w-4 h-4 mr-2"/> Nuevo Artículo
              </Button>
            </Link>
          </div>
          <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-200/50 dark:border-slate-800/50">
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Nombre</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Categoría</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Cantidad</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Ubicación</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map(item => (
                  <TableRow key={item.id} className="cursor-pointer group relative hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <TableCell className="font-medium">
                      <Link href={`/inventory/items/${item.id}`} className="absolute inset-0 z-10"></Link>
                      <span className="relative z-20 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{item.name}</span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{item.category}</TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{item.quantity} <span className="text-xs text-slate-400">{item.unit}</span></TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{item.location}</TableCell>
                    <TableCell>
                      {item.quantity <= item.minStock ? 
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">Stock Bajo</span> : 
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">Normal</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {tab === 'assets' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end">
            <Link href="/inventory/assets/new">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/20 rounded-full px-6 transition-all hover:scale-105">
                <PlusCircle className="w-4 h-4 mr-2"/> Nuevo Activo
              </Button>
            </Link>
          </div>
          <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-200/50 dark:border-slate-800/50">
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Nombre</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Categoría</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Valor</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">No. Serie</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map(a => (
                  <TableRow key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">{a.name}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{a.category}</TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">${a.purchaseValue?.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-400 dark:text-slate-500">{a.serialNumber}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border 
                        ${a.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                          a.status === 'maintenance' ? 'bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                          'bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
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
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-200/50 dark:border-slate-800/50">
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Fecha</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Tipo</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Artículo</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Cantidad</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Motivo / Cuenta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map(m => (
                  <TableRow key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {new Date(m.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell>
                      {m.type === 'in' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm">
                          <ArrowRightLeft className="w-3 h-3 rotate-90" /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-full text-xs border border-rose-200/60 dark:border-rose-500/20 shadow-sm">
                          <ArrowRightLeft className="w-3 h-3 -rotate-90" /> Salida
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">{m.itemName}</TableCell>
                    <TableCell className={`font-bold text-lg ${m.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {m.type === 'in' ? '+' : '-'}{m.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{m.notes}</span>
                          {m.accountName && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Vía: {m.accountName}</div>}
                        </div>
                        {m.receiptUrl && (
                          <a href={m.receiptUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm transition-colors">
                            <Paperclip className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <ArrowRightLeft className="w-8 h-8 text-slate-300" />
                        <p>No hay movimientos registrados.</p>
                      </div>
                    </TableCell>
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
