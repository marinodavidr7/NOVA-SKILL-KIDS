'use client';

import { useState, useEffect } from 'react';
import { getAssignments, deleteAssignment } from '@/lib/actions/transport';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, MapPin, Search, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch {
      toast.error('Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la asignación de ${name}? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await deleteAssignment(id);
      if (res.success) {
        toast.success('Asignación eliminada');
        setAssignments((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast.error(res.error || 'Error al eliminar');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error interno');
    }
  };

  const filtered = assignments.filter((a) => {
    const s = search.toLowerCase();
    return (
      !s ||
      a.childFirstName?.toLowerCase().includes(s) ||
      a.childLastName?.toLowerCase().includes(s) ||
      a.routeName?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/transport">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Niños Asignados
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gestión de inscripciones de niños a las diferentes rutas.
            </p>
          </div>
        </div>
        <Link href="/transport/assignments/new">
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 rounded-xl text-white">
            <PlusCircle className="h-4 w-4" />
            Nueva Asignación
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por niño o ruta..."
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
                  <TableHead>Niño</TableHead>
                  <TableHead>Ruta Asignada</TableHead>
                  <TableHead>Dirección de Recogida</TableHead>
                  <TableHead>Dirección de Entrega</TableHead>
                  <TableHead>Persona Autorizada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {search ? 'No se encontraron resultados.' : 'No hay niños asignados a rutas actualmente.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => {
                    const initials = `${(a.childFirstName?.[0] || '').toUpperCase()}${(a.childLastName?.[0] || '').toUpperCase()}`;
                    const fullName = `${a.childFirstName} ${a.childLastName}`;
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                              <AvatarImage src={a.childPhoto} />
                              <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium text-slate-900">{fullName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {a.routeName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div
                            className="text-sm text-slate-600 line-clamp-1 max-w-[200px]"
                            title={a.pickupAddress}
                          >
                            {a.pickupAddress || <span className="italic text-slate-400">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="text-sm text-slate-600 line-clamp-1 max-w-[200px]"
                            title={a.dropoffAddress}
                          >
                            {a.dropoffAddress || <span className="italic text-slate-400">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {a.authorizedPerson ? (
                            <span className="text-sm text-slate-700">{a.authorizedPerson}</span>
                          ) : (
                            <span className="text-slate-400 text-sm italic">Padres/Tutores</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(a.id, fullName)}
                              title="Eliminar asignación"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
