import { getAssetById, addMaintenanceRecord, deleteAsset } from '@/lib/actions/assets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteAssetButton } from './DeleteAssetButton';
import Link from 'next/link';
import { ArrowLeft, Monitor, Settings, Calendar, DollarSign, PenTool, ClipboardList, Info, Edit, Trash2 } from 'lucide-react';

export default async function AssetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assetId = parseInt(id);
  const data = await getAssetById(assetId);

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Activo no encontrado</div>;
  }

  // Bind the id to the server action
  const deleteAssetWithId = deleteAsset.bind(null, assetId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assets">
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/20">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Expediente del Activo Fijo</h1>
              <p className="text-sm text-muted-foreground">ID: #{String(data.id).padStart(4, '0')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data.status === 'active' && <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-bold border border-emerald-200">Operativo</span>}
          {data.status === 'maintenance' && <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-bold border border-amber-200">En Reparación</span>}
          {data.status === 'retired' && <span className="px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-sm font-bold border border-rose-200">Desincorporado</span>}
          
          <Link href={`/assets/${assetId}/edit`}>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          
          <DeleteAssetButton deleteAction={deleteAssetWithId} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-0 shadow-sm border-t-4 border-t-indigo-500">
            <CardHeader className="pb-3 bg-slate-50/50">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Info className="h-5 w-5" />
                <span>Detalles del Equipo</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre / Descripción</p>
                <p className="font-semibold text-slate-800 text-base">{data.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categoría</p>
                <p className="font-medium text-slate-700 bg-slate-100 inline-flex px-2 py-1 rounded">{data.category}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ubicación Asignada</p>
                <p className="font-medium text-slate-800">{data.location || 'No asignada'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Número de Serie</p>
                <p className="font-medium text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">{data.serialNumber || 'N/A'}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valor de Compra</p>
                <p className="font-bold text-indigo-700 text-lg">${data.purchaseValue?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de Adquisición</p>
                <p className="font-medium text-slate-800">{data.purchaseDate ? new Date(data.purchaseDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              {data.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notas</p>
                  <p className="font-medium text-slate-600 bg-yellow-50 p-2 rounded-lg border border-yellow-100/50">{data.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Maintenance History */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* New Maintenance Form */}
          <Card className="border-0 shadow-sm border-t-4 border-t-amber-500">
            <CardHeader className="pb-3 bg-amber-50/30">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <PenTool className="h-5 w-5" />
                <span>Registrar Mantenimiento o Reparación</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form action={addMaintenanceRecord.bind(null, assetId)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500">Fecha del Mantenimiento <span className="text-red-500">*</span></Label>
                    <Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500">Técnico / Proveedor</Label>
                    <Input name="technician" className="h-9" placeholder="Nombre del técnico" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs font-bold text-slate-500">Descripción del Trabajo <span className="text-red-500">*</span></Label>
                    <Input name="description" required className="h-9" placeholder="Limpieza, cambio de pieza, etc..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500">Costo (RD$)</Label>
                    <Input type="number" step="0.01" min="0" name="cost" defaultValue="0" className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500">Próximo Mantenimiento (Opcional)</Label>
                    <Input type="date" name="nextMaintenanceDate" className="h-9" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm">
                    Guardar Registro
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <ClipboardList className="h-5 w-5" />
                  <span>Historial de Intervenciones</span>
                </div>
                <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {data.maintenanceHistory?.length || 0} Registros
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción / Técnico</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Próxima Revisión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!data.maintenanceHistory || data.maintenanceHistory.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500 text-sm">
                        No hay mantenimientos registrados en el historial.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.maintenanceHistory.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium text-slate-700">{new Date(m.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <p className="text-slate-800 font-medium">{m.description}</p>
                          <p className="text-xs text-slate-500">Por: {m.technician || 'No especificado'}</p>
                        </TableCell>
                        <TableCell className="text-rose-600 font-semibold text-right sm:text-left">${m.cost?.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {m.nextMaintenanceDate ? new Date(m.nextMaintenanceDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
