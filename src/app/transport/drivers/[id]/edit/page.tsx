"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getDrivers, updateDriver } from '@/lib/actions/transport';

interface EditDriverPageProps {
  params: { id: string };
}

export default function EditDriverPage({ params }: EditDriverPageProps) {
  const router = useRouter();
  const driverId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    licenseExpiration: '',
    phone: '',
    address: '',
    status: 'Activo',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const drivers = await getDrivers();
        const driver = drivers.find((d: any) => d.id === driverId);
        if (!driver) {
          toast.error('Conductor no encontrado');
          router.push('/transport/drivers');
          return;
        }
        setFormData({
          firstName: driver.firstName ?? '',
          lastName: driver.lastName ?? '',
          licenseNumber: driver.licenseNumber ?? '',
          licenseExpiration: driver.licenseExpiration
            ? new Date(driver.licenseExpiration).toISOString().split('T')[0]
            : '',
          phone: driver.phone ?? '',
          address: driver.address ?? '',
          status: driver.status ?? 'Activo',
        });
      } catch (err: any) {
        toast.error('Error al cargar conductor');
        router.push('/transport/drivers');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [driverId, router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.licenseNumber.trim()) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        licenseExpiration: formData.licenseExpiration || null,
        phone: formData.phone || null,
        address: formData.address || null,
      };

      const res = await updateDriver(driverId, dataToSubmit);
      if (res.success) {
        toast.success('Conductor actualizado exitosamente');
        router.push('/transport/drivers');
      } else {
        toast.error(res.error || 'Error al actualizar conductor');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error interno');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 animate-pulse">Cargando conductor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/transport/drivers">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Editar Conductor
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Actualiza los datos del conductor.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600" />
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Nombre(s) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Ej. Juan Carlos"
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Apellido(s) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Ej. García López"
                  className="bg-slate-50"
                />
              </div>
            </div>

            {/* Row 2: License */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">
                  Número de Licencia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="licenseNumber"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  placeholder="Ej. A-123456"
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseExpiration">Vencimiento de Licencia</Label>
                <Input
                  id="licenseExpiration"
                  type="date"
                  value={formData.licenseExpiration}
                  onChange={(e) => handleChange('licenseExpiration', e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>

            {/* Row 3: Phone & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Ej. 809-555-0000"
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label htmlFor="address">Dirección</Label>
              <textarea
                id="address"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Dirección de residencia del conductor..."
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <Link href="/transport/drivers">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
