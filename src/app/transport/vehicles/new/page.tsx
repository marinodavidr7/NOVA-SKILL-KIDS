"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bus, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createVehicle } from '@/lib/actions/transport';

export default function NewVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    plate: '',
    capacity: '',
    status: 'Activo',
    insuranceExpiration: '',
    registrationExpiration: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.brand || !formData.model || !formData.plate || !formData.capacity) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        year: parseInt(formData.year) || null,
        capacity: parseInt(formData.capacity) || 0,
        insuranceExpiration: formData.insuranceExpiration || null,
        registrationExpiration: formData.registrationExpiration || null,
      };

      const res = await createVehicle(dataToSubmit);
      if (res.success) {
        toast.success("Vehículo registrado exitosamente");
        router.push('/transport/vehicles');
      } else {
        toast.error(res.error || "Error al registrar vehículo");
      }
    } catch (e: any) {
      toast.error(e.message || "Error interno");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href="/transport/vehicles">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Nuevo Vehículo</h1>
            <p className="text-sm text-slate-500 mt-0.5">Registra una nueva unidad en la flotilla.</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Código Interno <span className="text-red-500">*</span></Label>
                <Input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Ej. BUS-01" className="bg-slate-50" />
              </div>
              
              <div className="space-y-2">
                <Label>Placa <span className="text-red-500">*</span></Label>
                <Input required value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} placeholder="Ej. I123456" className="bg-slate-50 uppercase" />
              </div>

              <div className="space-y-2">
                <Label>Marca <span className="text-red-500">*</span></Label>
                <Input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Ej. Toyota" className="bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label>Modelo <span className="text-red-500">*</span></Label>
                <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Ej. Coaster" className="bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label>Año</Label>
                <Input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="Ej. 2020" className="bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label>Capacidad (Pasajeros) <span className="text-red-500">*</span></Label>
                <Input required type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="Ej. 30" className="bg-slate-50" />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Activo">Activo</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label>Vencimiento de Seguro</Label>
                <Input type="date" value={formData.insuranceExpiration} onChange={e => setFormData({...formData, insuranceExpiration: e.target.value})} className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Vencimiento de Matrícula (Marbete)</Label>
                <Input type="date" value={formData.registrationExpiration} onChange={e => setFormData({...formData, registrationExpiration: e.target.value})} className="bg-slate-50" />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label>Notas / Observaciones</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Detalles adicionales sobre el vehículo..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <Link href="/transport/vehicles">
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Vehículo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
