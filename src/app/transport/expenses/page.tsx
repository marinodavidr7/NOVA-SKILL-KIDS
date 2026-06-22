'use client';

import { useState, useEffect } from 'react';
import { getExpenses, deleteExpense } from '@/lib/actions/transport';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, PlusCircle, Search, Trash2, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const EXPENSE_TYPE_COLORS: Record<string, string> = {
  Combustible: 'bg-orange-100 text-orange-700 border-orange-200',
  Mantenimiento: 'bg-blue-100 text-blue-700 border-blue-200',
  Reparacion: 'bg-red-100 text-red-700 border-red-200',
  Seguro: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Otro: 'bg-slate-100 text-slate-700 border-slate-200',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace('DOP', 'RD$');
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch {
      toast.error('Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este gasto? Esta acción no se puede deshacer.')) return;
    try {
      const res = await deleteExpense(id);
      if (res.success) {
        toast.success('Gasto eliminado');
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } else {
        toast.error(res.error || 'Error al eliminar');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error interno');
    }
  };

  const filtered = expenses.filter((e) => {
    const s = search.toLowerCase();
    return (
      !s ||
      e.vehicleBrand?.toLowerCase().includes(s) ||
      e.vehicleModel?.toLowerCase().includes(s) ||
      e.vehiclePlate?.toLowerCase().includes(s) ||
      e.type?.toLowerCase().includes(s) ||
      e.description?.toLowerCase().includes(s)
    );
  });

  const totalAmount = filtered.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/transport">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
            <TrendingDown className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Control de Gastos
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Combustible, mantenimiento, reparaciones y seguros de la flotilla.
            </p>
          </div>
        </div>
        <Link href="/transport/expenses/new">
          <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 rounded-xl text-white">
            <PlusCircle className="h-4 w-4" />
            Nuevo Gasto
          </Button>
        </Link>
      </div>

      {/* Summary badge */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
          <TrendingDown className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-900">
            Total mostrado:{' '}
            <span className="font-black text-orange-700">{formatCurrency(totalAmount)}</span>
            {' '}({filtered.length} registro{filtered.length !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por vehículo, tipo o descripción..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading && (
              <span className="text-xs text-slate-400 animate-pulse">Cargando...</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {search
                        ? 'No se encontraron resultados.'
                        : 'No hay gastos registrados todavía.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {e.vehicleBrand} {e.vehicleModel}
                        </div>
                        <div className="text-xs text-slate-500">{e.vehiclePlate}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {e.date
                            ? new Date(e.date).toLocaleDateString('es-DO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            EXPENSE_TYPE_COLORS[e.type] ?? EXPENSE_TYPE_COLORS['Otro']
                          }`}
                        >
                          {e.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div
                          className="text-sm text-slate-600 line-clamp-1 max-w-[220px]"
                          title={e.description}
                        >
                          {e.description || <span className="italic text-slate-400">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(Number(e.amount))}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(e.id)}
                          title="Eliminar gasto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
