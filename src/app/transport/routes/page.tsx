"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Pencil, Trash2, Route, Search, MapPin } from 'lucide-react';
import { getRoutes, deleteRoute } from '@/lib/actions/transport';

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadRoutes = async () => {
    try {
      const data = await getRoutes();
      setRoutes(data);
    } catch (err: any) {
      toast.error('Error al cargar las rutas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la ruta "${name}"? Esta acción también eliminará todas sus paradas.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await deleteRoute(id);
      if (res.success) {
        toast.success(`Ruta "${name}" eliminada`);
        setRoutes(prev => prev.filter(r => r.id !== id));
      } else {
        toast.error(res.error || 'Error al eliminar la ruta');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error interno');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = routes.filter(r => {
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.sectors?.toLowerCase().includes(q) ||
      r.driverFirstName?.toLowerCase().includes(q) ||
      r.driverLastName?.toLowerCase().includes(q) ||
      r.vehiclePlate?.toLowerCase().includes(q)
    );
  });

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
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Route className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Rutas Activas
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configuración de rutas, horarios, vehículos y conductores asignados.
            </p>
          </div>
        </div>
        <Link href="/transport/routes/new">
          <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 rounded-xl text-white">
            <PlusCircle className="h-4 w-4" />
            Nueva Ruta
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
                placeholder="Buscar por nombre, sector, placa..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {!loading && (
              <span className="text-sm text-slate-400">
                {filtered.length} ruta{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre / Sectores</TableHead>
                  <TableHead>Vehículo Asignado</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Horario (Ida - Vuelta)</TableHead>
                  <TableHead>Paradas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Cargando rutas...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {search ? 'No se encontraron rutas con ese criterio.' : 'No hay rutas registradas.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(r => (
                    <TableRow key={r.id}>
                      {/* Name / Sectors */}
                      <TableCell>
                        <div className="font-medium text-slate-900">{r.name}</div>
                        {r.sectors && (
                          <div className="text-xs text-slate-500 mt-0.5 max-w-[220px] truncate">
                            {r.sectors}
                          </div>
                        )}
                      </TableCell>

                      {/* Vehicle */}
                      <TableCell>
                        {r.vehicleId ? (
                          <div className="font-medium text-slate-700">
                            {r.vehicleBrand} {r.vehicleModel}
                            <span className="ml-1 text-xs text-slate-500 uppercase">
                              — {r.vehiclePlate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-sm">Sin vehículo</span>
                        )}
                      </TableCell>

                      {/* Driver */}
                      <TableCell>
                        {r.driverId ? (
                          <span className="text-slate-700">
                            {r.driverFirstName} {r.driverLastName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-sm">Sin conductor</span>
                        )}
                      </TableCell>

                      {/* Schedule */}
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="w-10 inline-block text-xs text-slate-400">Ida:</span>
                            {r.departureTime || '--:--'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-10 inline-block text-xs text-slate-400">Vuelta:</span>
                            {r.returnTime || '--:--'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Stops count badge */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-600 bg-slate-100 w-fit px-2 py-0.5 rounded-full text-xs font-semibold">
                          <MapPin className="h-3 w-3" />
                          {r.stops?.length || 0}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            r.status === 'Activo'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/transport/routes/${r.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Eliminar"
                            disabled={deletingId === r.id}
                            onClick={() => handleDelete(r.id, r.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
