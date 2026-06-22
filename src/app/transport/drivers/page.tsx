"use client";

import { useState, useEffect, useMemo } from 'react';
import { getDrivers, deleteDriver } from '@/lib/actions/transport';
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
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Pencil, Trash2, Users, Search } from 'lucide-react';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDrivers = async () => {
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (err: any) {
      toast.error('Error al cargar conductores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return drivers;
    const q = searchQuery.toLowerCase();
    return drivers.filter(
      (d) =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        (d.licenseNumber ?? '').toLowerCase().includes(q) ||
        (d.phone ?? '').toLowerCase().includes(q)
    );
  }, [drivers, searchQuery]);

  const handleDelete = async (driver: any) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar al conductor "${driver.firstName} ${driver.lastName}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(driver.id);
    try {
      const res = await deleteDriver(driver.id);
      if (res.success) {
        toast.success('Conductor eliminado exitosamente');
        setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
      } else {
        toast.error(res.error || 'Error al eliminar conductor');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error interno');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/transport">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Conductores
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Directorio del personal asignado a la flotilla vehicular.
            </p>
          </div>
        </div>
        <Link href="/transport/drivers/new">
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 rounded-xl text-white">
            <PlusCircle className="h-4 w-4" />
            Nuevo Conductor
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {/* Search bar */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o licencia..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!isLoading && (
              <span className="text-sm text-slate-500">
                {filtered.length} {filtered.length === 1 ? 'conductor' : 'conductores'}
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Venc. Licencia</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground animate-pulse">
                      Cargando conductores...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {searchQuery ? 'No se encontraron conductores con esa búsqueda.' : 'No hay conductores registrados.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        {d.firstName} {d.lastName}
                      </TableCell>
                      <TableCell>{d.licenseNumber || 'N/A'}</TableCell>
                      <TableCell>
                        {d.licenseExpiration
                          ? new Date(d.licenseExpiration).toLocaleDateString('es-DO')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{d.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            d.status === 'Activo'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {d.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/transport/drivers/${d.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            disabled={deletingId === d.id}
                            onClick={() => handleDelete(d)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
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
