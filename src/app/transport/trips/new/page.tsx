'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createTrip } from '@/lib/actions/trips';

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      destination: formData.get('destination') as string,
      date: formData.get('date') as string,
      departureTime: formData.get('departureTime') as string,
      returnTime: formData.get('returnTime') as string,
      totalCapacity: parseInt(formData.get('totalCapacity') as string) || 50,
      costPerStudent: parseFloat(formData.get('costPerStudent') as string) || 0,
      costPerAdult: parseFloat(formData.get('costPerAdult') as string) || 0,
      notes: formData.get('notes') as string,
    };

    const res = await createTrip(data);
    if (res.success) {
      router.push(`/transport/trips/${res.id}`);
    } else {
      setError(res.error || 'Error al registrar el viaje');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Registrar Viaje</h1>
        <p className="text-sm text-slate-500 mt-1">Planifica una nueva excursión.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Viaje</CardTitle>
          <CardDescription>Rellena la información logística y financiera.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre / Título</Label>
                <Input id="name" name="name" placeholder="Ej. Visita al Acuario" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Input id="destination" name="destination" placeholder="Lugar a visitar" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Hora Salida</Label>
                <Input id="departureTime" name="departureTime" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnTime">Hora Regreso</Label>
                <Input id="returnTime" name="returnTime" type="time" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="totalCapacity">Capacidad (Asientos)</Label>
                <Input id="totalCapacity" name="totalCapacity" type="number" defaultValue="50" min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerStudent">Costo p/ Alumno ($)</Label>
                <Input id="costPerStudent" name="costPerStudent" type="number" step="0.01" defaultValue="0" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerAdult">Costo p/ Adulto ($)</Label>
                <Input id="costPerAdult" name="costPerAdult" type="number" step="0.01" defaultValue="0" min="0" required />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4 mt-4">
              <Label htmlFor="notes">Notas y Logística (Opcional)</Label>
              <Textarea id="notes" name="notes" placeholder="Qué llevar, itinerario..." />
            </div>

            <div className="pt-4 flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear Viaje'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
