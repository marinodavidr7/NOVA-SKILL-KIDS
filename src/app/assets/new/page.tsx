import { createAsset } from '@/lib/actions/assets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Monitor, Save, Tag, MapPin, Hash, DollarSign, Calendar, Info } from 'lucide-react';

export default function NewAssetPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
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
            <h1 className="text-2xl font-bold tracking-tight">Registrar Activo Fijo</h1>
            <p className="text-sm text-muted-foreground">Agrega un nuevo equipo o mobiliario al inventario institucional.</p>
          </div>
        </div>
      </div>

      <form action={createAsset} className="space-y-6">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100/50 pb-4">
            <div className="flex items-center gap-2 text-indigo-800">
              <Info className="h-5 w-5" />
              <CardTitle className="text-lg">Detalles del Activo</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-indigo-600" />
                  Nombre / Descripción del Activo <span className="text-red-500">*</span>
                </Label>
                <Input name="name" required className="h-11 rounded-xl shadow-sm" placeholder="Ej. Televisor Samsung 55' 4K..." />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-indigo-600" />
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select name="category" defaultValue="" className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none shadow-sm" required>
                    <option value="" disabled>Seleccione...</option>
                    <option value="Televisores">Televisores</option>
                    <option value="Radios">Radios</option>
                    <option value="Computadoras">Computadoras</option>
                    <option value="Cámaras">Cámaras de Seguridad</option>
                    <option value="Impresoras">Impresoras</option>
                    <option value="Neveras">Neveras y Electrodomésticos</option>
                    <option value="Mobiliario">Mobiliario</option>
                    <option value="Cunas">Cunas</option>
                    <option value="Juguetes">Juguetes Grandes</option>
                    <option value="Equipos educativos">Equipos Educativos</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  Ubicación Asignada
                </Label>
                <Input name="location" className="h-11 rounded-xl shadow-sm" placeholder="Ej. Aula 1, Recepción, Cocina..." />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Hash className="h-4 w-4 text-indigo-600" />
                  Número de Serie / Etiqueta
                </Label>
                <Input name="serialNumber" className="h-11 rounded-xl shadow-sm" placeholder="Opcional" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-indigo-600" />
                  Estado Inicial <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select name="status" className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none shadow-sm" required>
                    <option value="active">Operativo / Nuevo</option>
                    <option value="maintenance">En Reparación</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Fecha de Adquisición
                </Label>
                <Input type="date" name="purchaseDate" defaultValue={new Date().toISOString().split('T')[0]} className="h-11 rounded-xl shadow-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-indigo-600" />
                  Valor de Compra (RD$)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">$</span>
                  </div>
                  <Input type="number" step="0.01" min="0" name="purchaseValue" defaultValue="0.00" className="pl-7 h-11 rounded-xl shadow-sm font-semibold" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Notas Adicionales</Label>
                <textarea name="notes" className="w-full h-24 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm resize-none" placeholder="Especificaciones técnicas, observaciones..."></textarea>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/assets">
            <Button type="button" variant="outline" className="rounded-xl px-6 h-11 border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</Button>
          </Link>
          <Button 
            type="submit" 
            className="h-11 gap-2 rounded-xl px-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/25 transition-all duration-300 font-semibold"
          >
            <Save className="h-5 w-5" />
            Guardar Activo
          </Button>
        </div>
      </form>
    </div>
  );
}
