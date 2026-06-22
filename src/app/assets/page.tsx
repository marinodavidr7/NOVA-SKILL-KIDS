import { getAssets } from "@/lib/actions/assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Monitor, PlusCircle, Laptop, Settings, BadgeAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function AssetsPage() {
  const assets = await getAssets();

  const totalAssets = assets.length;
  const activeAssets = assets.filter((a: any) => a.status === 'active').length;
  const maintenanceAssets = assets.filter((a: any) => a.status === 'maintenance').length;
  const totalValue = assets.reduce((sum: number, a: any) => sum + (a.purchaseValue || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/20">
            <Monitor className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Activos Fijos</h1>
            <p className="text-sm text-slate-500 mt-1">
              Registro y control de mobiliario, equipos tecnológicos y bienes de la institución.
            </p>
          </div>
        </div>
        <Link href="/assets/new">
          <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 rounded-xl">
            <PlusCircle className="h-4 w-4" />
            Registrar Activo
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50 border-t-4 border-t-indigo-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Total Equipos</p>
                <p className="text-3xl font-black text-indigo-900 mt-2">{totalAssets}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Laptop className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Operativos</p>
                <p className="text-3xl font-black text-emerald-900 mt-2">{activeAssets}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">En Reparación</p>
                <p className="text-3xl font-black text-amber-900 mt-2">{maintenanceAssets}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <BadgeAlert className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-gray-50 border-t-4 border-t-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Valor Estimado</p>
                <p className="text-3xl font-black text-slate-800 mt-2">${totalValue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                <Monitor className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nombre del Activo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Valor (RD$)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Monitor className="h-8 w-8 text-slate-300" />
                      <p>No hay activos fijos registrados</p>
                      <Link href="/assets/new">
                        <Button variant="link" className="text-indigo-600">Registrar el primero</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset: any) => (
                  <TableRow key={asset.id} className="hover:bg-indigo-50/30">
                    <TableCell>
                      <div className="font-semibold text-slate-800">{asset.name}</div>
                      {asset.serialNumber && typeof asset.serialNumber === 'string' && !asset.serialNumber.toLowerCase().includes('n/a') && asset.serialNumber !== 'null' && (
                        <div className="text-xs text-slate-500">Serie: {asset.serialNumber}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{asset.category}</TableCell>
                    <TableCell className="text-slate-600">{asset.location || 'No asignada'}</TableCell>
                    <TableCell className="font-medium text-slate-700">${asset.purchaseValue?.toLocaleString()}</TableCell>
                    <TableCell>
                      {asset.status === 'active' && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Operativo</span>}
                      {asset.status === 'maintenance' && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">En Reparación</span>}
                      {asset.status === 'retired' && <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">Desincorporado</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/assets/${asset.id}`}>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-medium">
                          Gestionar
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
