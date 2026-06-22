import { getVehicles } from '@/lib/actions/transport';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Bus, Search , ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/transport">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Bus className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Flota de Vehículos</h1>
            <p className="text-sm text-slate-500 mt-1">Administra los autobuses y vehículos de Nova Skill Kids.</p>
          </div>
        </div>
        <Link href="/transport/vehicles/new">
          <Button className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 rounded-xl text-white">
            <PlusCircle className="h-4 w-4" />
            Nuevo Vehículo
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por placa o marca..." className="pl-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Venc. Seguro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No hay vehículos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.code}</TableCell>
                      <TableCell>{v.brand} {v.model} ({v.year})</TableCell>
                      <TableCell>{v.plate}</TableCell>
                      <TableCell>{v.capacity} pax</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          v.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 
                          v.status === 'Mantenimiento' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {v.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(v.insuranceExpiration).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/transport/vehicles/${v.id}`}>
                          <Button variant="ghost" size="sm">Editar</Button>
                        </Link>
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
