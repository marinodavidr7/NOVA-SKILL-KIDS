"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingDown, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createExpense, getVehicles } from '@/lib/actions/transport';

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

const textareaClass =
  "flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const EXPENSE_TYPES = ['Combustible', 'Mantenimiento', 'Reparacion', 'Seguro', 'Otro'];

function todayString() {
  return new Date().toISOString().split('T')[0];
}

export default function NewExpensePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: todayString(),
    type: 'Combustible',
    amount: '',
    description: '',
  });

  useEffect(() => {
    getVehicles()
      .then(setVehicles)
      .catch(() => toast.error('Error cargando vehículos'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error('Por favor selecciona un vehículo.');
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast.error('Por favor ingresa un monto válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createExpense({
        vehicleId: parseInt(formData.vehicleId),
        date: formData.date,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
      });
      if (res.success) {
        toast.success('Gasto registrado exitosamente');
        router.push('/transport/expenses');
      } else {
        toast.error(res.error || 'Error al registrar gasto');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error interno');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/transport/expenses">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
            <TrendingDown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Nuevo Gasto
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Registra un gasto operativo de la flotilla de transporte.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600" />
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Vehicle & date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  Vehículo <span className="text-red-500">*</span>
                </Label>
                <select
                  required
                  className={selectClass}
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                >
                  <option value="">-- Selecciona un vehículo --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} — {v.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  Fecha <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-slate-50"
                />
              </div>
            </div>

            {/* Type & amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  Tipo de Gasto <span className="text-red-500">*</span>
                </Label>
                <select
                  required
                  className={selectClass}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {EXPENSE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  Monto (RD$) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                    RD$
                  </span>
                  <Input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="bg-slate-50 pl-12"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descripción / Observaciones</Label>
              <textarea
                className={textareaClass}
                placeholder="Ej. Cambio de aceite 5W-30, 4 litros. Taller El Motor..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <Link href="/transport/expenses">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
