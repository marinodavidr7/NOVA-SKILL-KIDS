"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowLeft, Save, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createAssignment, getRoutes } from '@/lib/actions/transport';
import { getChildren } from '@/lib/actions/children';

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

const textareaClass =
  "flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function NewAssignmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [childSearch, setChildSearch] = useState('');
  const [formData, setFormData] = useState({
    childId: '',
    routeId: '',
    pickupAddress: '',
    dropoffAddress: '',
    authorizedPerson: '',
    specialSchedule: '',
  });

  useEffect(() => {
    getChildren().then(setChildren).catch(() => toast.error('Error cargando niños'));
    getRoutes().then(setRoutes).catch(() => toast.error('Error cargando rutas'));
  }, []);

  const filteredChildren = children.filter((c) => {
    const search = childSearch.toLowerCase();
    return (
      !search ||
      c.firstName?.toLowerCase().includes(search) ||
      c.lastName?.toLowerCase().includes(search)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.childId || !formData.routeId) {
      toast.error('Por favor selecciona un niño y una ruta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAssignment({
        ...formData,
        childId: parseInt(formData.childId),
        routeId: parseInt(formData.routeId),
        pickupAddress: formData.pickupAddress || null,
        dropoffAddress: formData.dropoffAddress || null,
        authorizedPerson: formData.authorizedPerson || null,
        specialSchedule: formData.specialSchedule || null,
      });
      if (res.success) {
        toast.success('Asignación creada exitosamente');
        router.push('/transport/assignments');
      } else {
        toast.error(res.error || 'Error al crear asignación');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error interno');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/transport/assignments">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Nueva Asignación
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Asigna un niño a una ruta de transporte escolar.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600" />
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Child selector */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Niño a Asignar
              </h3>
              <div className="space-y-2">
                <Label>Buscar Niño</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={childSearch}
                    onChange={(e) => setChildSearch(e.target.value)}
                    placeholder="Escriba nombre o apellido..."
                    className="bg-slate-50 pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Seleccionar Niño <span className="text-red-500">*</span>
                </Label>
                <select
                  required
                  className={selectClass}
                  value={formData.childId}
                  onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                >
                  <option value="">-- Selecciona un niño --</option>
                  {filteredChildren.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                      {c.classroomName ? ` — ${c.classroomName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Route selector */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Ruta de Transporte
              </h3>
              <div className="space-y-2">
                <Label>
                  Ruta Asignada <span className="text-red-500">*</span>
                </Label>
                <select
                  required
                  className={selectClass}
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                >
                  <option value="">-- Selecciona una ruta --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.vehiclePlate ? ` (${r.vehicleBrand} ${r.vehicleModel} — ${r.vehiclePlate})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address fields */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Direcciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Dirección de Recogida</Label>
                  <Input
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    placeholder="Ej. Calle El Sol #12, La Romana"
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección de Entrega</Label>
                  <Input
                    value={formData.dropoffAddress}
                    onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                    placeholder="Ej. Centro Escolar Nova Skill"
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Authorized person & special schedule */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Información Adicional
              </h3>
              <div className="space-y-2">
                <Label>Persona Autorizada para Recogida</Label>
                <Input
                  value={formData.authorizedPerson}
                  onChange={(e) => setFormData({ ...formData, authorizedPerson: e.target.value })}
                  placeholder="Nombre completo (dejar vacío si son los padres/tutores)"
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-400">
                  Dejar vacío si la recogida la realizan los padres o tutores habituales.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Horario Especial / Notas</Label>
                <textarea
                  className={textareaClass}
                  placeholder="Ej. Solo lunes y miércoles, recogida a las 3:30pm..."
                  value={formData.specialSchedule}
                  onChange={(e) => setFormData({ ...formData, specialSchedule: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <Link href="/transport/assignments">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Asignación'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
