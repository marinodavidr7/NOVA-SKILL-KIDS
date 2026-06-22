'use client';

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  PlusCircle, Search, Filter, Download,
  Eye, Edit, Trash2, Users, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { deleteParent } from '@/lib/actions/parents';
import { toast } from 'sonner';

type Parent = {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  createdAt?: string | null;
};

type FilterOption = 'all' | 'with_email' | 'without_email';

const FILTER_LABELS: Record<FilterOption, string> = {
  all: 'Todos',
  with_email: 'Con email',
  without_email: 'Sin email',
};

export default function ParentsClient({ parents }: { parents: Parent[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [deleting, setDeleting] = useState<number | null>(null);

  /* ── Filtered + searched list ── */
  const filtered = useMemo(() => {
    let list = parents;

    if (filter === 'with_email') {
      list = list.filter((p) => p.email && p.email.trim() !== '');
    } else if (filter === 'without_email') {
      list = list.filter((p) => !p.email || p.email.trim() === '');
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          (p.phone ?? '').toLowerCase().includes(q) ||
          (p.email ?? '').toLowerCase().includes(q),
      );
    }

    return list;
  }, [parents, filter, search]);

  /* ── Excel Export ── */
  const handleExport = () => {
    const data = filtered.map((p) => ({
      ID: p.id,
      Nombre: `${p.firstName} ${p.lastName}`,
      Teléfono: p.phone ?? '',
      Email: p.email ?? '',
      Dirección: p.address ?? '',
      'Fecha Registro': p.createdAt
        ? new Date(p.createdAt).toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric',
          })
        : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Padres y Tutores');
    
    // Auto-size columns slightly
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 25 }, // Nombre
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Email
      { wch: 40 }, // Dirección
      { wch: 15 }  // Fecha Registro
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, 'padres-tutores.xlsx');
    toast.success('Exportación a Excel completada');
  };

  /* ── Delete ── */
  const [parentToDelete, setParentToDelete] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (parentToDelete === null) return;
    setDeleting(parentToDelete);
    try {
      await deleteParent(parentToDelete);
      toast.success('Registro eliminado');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(null);
      setParentToDelete(null);
    }
  };

  const isFiltered = filter !== 'all';

  return (
    <>
      {/* Search / filter bar */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, teléfono, email..."
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-violet-500/30 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {/* Filter dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isFiltered
                      ? 'border-violet-400 bg-violet-50 text-violet-700 hover:bg-violet-100'
                      : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {isFiltered && (
                    <span className="ml-0.5 flex h-2 w-2 rounded-full bg-violet-600" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Filtrar por email</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={filter}
                    onValueChange={(v) => setFilter(v as FilterOption)}
                  >
                    {(Object.keys(FILTER_LABELS) as FilterOption[]).map((key) => (
                      <DropdownMenuRadioItem key={key} value={key}>
                        {FILTER_LABELS[key]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Active filter pill */}
          {isFiltered && (
            <p className="mt-2 text-xs text-violet-600">
              Filtro activo:{' '}
              <span className="font-semibold">{FILTER_LABELS[filter]}</span>
              {' · '}
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              <button
                className="ml-2 underline hover:no-underline"
                onClick={() => setFilter('all')}
              >
                Limpiar
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[72px] pl-6">Avatar</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <Users className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {search || isFiltered
                            ? 'No se encontraron resultados'
                            : 'No hay padres o tutores registrados'}
                        </p>
                        <p className="text-sm">
                          {search || isFiltered
                            ? 'Intenta con otros criterios de búsqueda.'
                            : 'Comienza registrando al primer padre o tutor.'}
                        </p>
                      </div>
                      {!search && !isFiltered && (
                        <Link href="/parents/new">
                          <Button
                            size="sm"
                            className="mt-2 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Registrar Padre/Tutor
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((parent, index) => {
                  const initials = `${(parent.firstName?.[0] ?? '').toUpperCase()}${(
                    parent.lastName?.[0] ?? ''
                  ).toUpperCase()}`;
                  const createdAt = parent.createdAt
                    ? new Date(parent.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })
                    : '—';

                  return (
                    <TableRow
                      key={parent.id}
                      className="group hover:bg-violet-50/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="pl-6">
                        <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                          {parent.photoUrl && (
                            <AvatarImage
                              src={parent.photoUrl}
                              alt={`${parent.firstName} ${parent.lastName}`}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">
                            {parent.firstName} {parent.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: #{String(parent.id).padStart(4, '0')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {parent.phone || (
                          <span className="text-muted-foreground/50 italic">
                            Sin teléfono
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {parent.email ? (
                          <span className="text-muted-foreground">{parent.email}</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100/80 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Sin email
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {parent.address || (
                          <span className="text-muted-foreground/50 italic">
                            Sin dirección
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Link href={`/parents/${parent.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-violet-600 hover:bg-violet-100 hover:text-violet-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/parents/${parent.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
                            disabled={deleting === parent.id}
                            onClick={() => setParentToDelete(parent.id)}
                            title="Eliminar"
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={parentToDelete !== null} onOpenChange={(open) => { if (!open) setParentToDelete(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Eliminar Padre/Tutor
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">¿Estás seguro de que deseas eliminar este registro de forma permanente? Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setParentToDelete(null)} disabled={deleting !== null}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting !== null}>
              {deleting !== null ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Sí, Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
