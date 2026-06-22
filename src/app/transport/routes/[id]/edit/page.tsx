"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Route, ArrowLeft, Save, Plus, X, MapPin } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getRoutes, updateRoute, getVehicles, getDrivers } from '@/lib/actions/transport';

interface Stop {
  name: string;
  time: string;
}

export default function EditRoutePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    sectors: '',
    departureTime: '',
    returnTime: '',
    vehicleId: '',
    driverId: '',
    status: 'Activo',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [allRoutes, allVehicles, allDrivers] = await Promise.all([
          getRoutes(),
          getVehicles(),
          getDrivers(),
        ]);

        setVehicles(allVehicles);
        setDrivers(allDrivers);

        const route = allRoutes.find((r: any) => r.id === id);
        if (!route) {
          toast.error('Ruta no encontrada');
          router.push('/transport/routes');
          return;
        }

        setFormData({
          name: route.name || '',
          sectors: route.sectors || '',
          departureTime: route.departureTime || '',
          returnTime: route.returnTime || '',
          vehicleId: route.vehicleId ? String(route.vehicleId) : '',
          driverId: route.driverId ? String(route.driverId) : '',
          status: route.status || 'Activo',
        });

        if (Array.isArray(route.stops)) {
          setStops(
            route.stops.map((s: any) => ({ name: s.name || '', time: s.time || '' }))
          );
        }
      } catch (err: any) {
        toast.error('Error al cargar la ruta');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  const addStop = () => {
    setStops(prev => [...prev, { name: '', time: '' }]);
  };

  const removeStop = (index: number) => {
    setStops(prev => prev.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, field: keyof Stop, value: string) => {
    setStops(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.departureTime) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        name: formData.name,
        sectors: formData.sectors || null,
        departureTime: formData.departureTime,
        returnTime: formData.returnTime || null,
        vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : null,
        driverId: formData.driverId ? parseInt(formData.driverId) : null,
        status: formData.status,
        stops: stops.filter(s => s.name.trim() !== ''),
      };

      const res = await updateRoute(id, dataToSubmit);
      if (res.success) {
        toast.success('Ruta actualizada exitosamente');
        router.push('/transport/routes');
      } else {
        toast.error(res.error || 'Error al actualizar la ruta');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error interno');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Cargando ruta...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/transport/routes">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Route className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Editar Ruta
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Modifica los datos de la ruta y sus paradas.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Nombre de la Ruta <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Ruta Norte — Sector Las Palmas"
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Sectores / Descripción</Label>
                <Input
                  value={formData.sectors}
                  onChange={e => setFormData({ ...formData, sectors: e.target.value })}
                  placeholder="Ej. Urb. Los Pinos, Calle 5, Sector Central..."
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Hora de Salida (Ida) <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  type="time"
                  value={formData.departureTime}
                  onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Hora de Regreso (Vuelta)</Label>
                <Input
                  type="time"
                  value={formData.returnTime}
                  onChange={e => setFormData({ ...formData, returnTime: e.target.value })}
                  className="bg-slate-50"
                />
              </div>
            </div>

            {/* Vehicle & Driver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label>Vehículo Asignado</Label>
                <select
                  className={selectClass}
                  value={formData.vehicleId}
                  onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                >
                  <option value="">— Sin vehículo —</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} — {v.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Conductor Asignado</Label>
                <select
                  className={selectClass}
                  value={formData.driverId}
                  onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                >
                  <option value="">— Sin conductor —</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <select
                  className={selectClass}
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Dynamic Stops */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <Label className="text-base font-semibold text-slate-800">
                    Paradas ({stops.length})
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStop}
                  className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar Parada
                </Button>
              </div>

              {stops.length === 0 && (
                <div className="text-center py-6 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">
                  No hay paradas. Haz clic en &ldquo;Agregar Parada&rdquo; para añadir.
                </div>
              )}

              <div className="space-y-3">
                {stops.map((stop, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <Input
                      placeholder="Nombre de la parada"
                      value={stop.name}
                      onChange={e => updateStop(index, 'name', e.target.value)}
                      className="bg-white flex-1"
                    />
                    <Input
                      type="time"
                      value={stop.time}
                      onChange={e => updateStop(index, 'time', e.target.value)}
                      className="bg-white w-36"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStop(index)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <Link href="/transport/routes">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Actualizar Ruta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
