"use client";

import { useEffect, useState } from "react";
import { getPackages, createPackage, deletePackage, updatePackage, SubscriptionPackage } from "@/lib/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Package, Clock, Calendar, DollarSign, CalendarDays, Users, GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<SubscriptionPackage>({
    name: "",
    description: "",
    schedule_days: "",
    duration_weeks: 0,
    enrollment_fee: 0,
    periodic_fee: 0,
    periodic_frequency: "mensual",
    payment_day_spec: "",
    total_fee: 0,
    discount_percentage: 0,
    min_age: 0,
    max_age: 0,
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    capacity: 0
  });

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Calculate Total Fee automatically
  useEffect(() => {
    const enrollment = Number(formData.enrollment_fee || 0);
    const periodic = Number(formData.periodic_fee || 0);
    const duration = Number(formData.duration_weeks || 0);
    const total = enrollment + (periodic * duration);
    setFormData(prev => ({ ...prev, total_fee: total }));
  }, [formData.enrollment_fee, formData.periodic_fee, formData.duration_weeks]);

  // End Date calculations moved to handleChange

  // Sync selectedDays with schedule_days
  useEffect(() => {
    setFormData(prev => ({ ...prev, schedule_days: selectedDays.join(', ') }));
  }, [selectedDays]);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const data = await getPackages();
      setPackages(data as SubscriptionPackage[]);
    } catch (error) {
      console.error("Failed to load packages", error);
      toast.error("Error al cargar los paquetes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: any = value;
    
    if (name.includes("fee") || name === "duration_weeks" || name.includes("percentage") || name.includes("age") || name.includes("capacity")) {
      parsedValue = Number(value);
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: parsedValue };
      
      // Auto-calculations for dates and weeks
      if (name === 'start_date' || name === 'end_date' || name === 'duration_weeks') {
        if ((name === 'start_date' || name === 'end_date') && next.start_date && next.end_date) {
          const start = new Date(next.start_date + 'T00:00:00');
          const end = new Date(next.end_date + 'T00:00:00');
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            next.duration_weeks = Math.ceil(diffDays / 7);
          }
        } else if ((name === 'duration_weeks' || name === 'start_date') && next.start_date && next.duration_weeks) {
          const start = new Date(next.start_date + 'T00:00:00');
          if (!isNaN(start.getTime())) {
            start.setDate(start.getDate() + (Number(next.duration_weeks) * 7));
            next.end_date = start.toISOString().split('T')[0];
          }
        }
      }
      return next;
    });
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleOpenDialog = (pkg?: SubscriptionPackage) => {
    if (pkg) {
      setEditingId(pkg.id as number);
      setFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        schedule_days: pkg.schedule_days || "",
        duration_weeks: pkg.duration_weeks || 0,
        enrollment_fee: pkg.enrollment_fee || 0,
        periodic_fee: pkg.periodic_fee || 0,
        periodic_frequency: pkg.periodic_frequency || "mensual",
        payment_day_spec: pkg.payment_day_spec || "",
        total_fee: pkg.total_fee || 0,
        discount_percentage: pkg.discount_percentage || 0,
        min_age: pkg.min_age || 0,
        max_age: pkg.max_age || 0,
        start_date: pkg.start_date ? new Date(pkg.start_date).toISOString().split('T')[0] : "",
        end_date: pkg.end_date ? new Date(pkg.end_date).toISOString().split('T')[0] : "",
        start_time: pkg.start_time || "",
        end_time: pkg.end_time || "",
        capacity: pkg.capacity || 0
      });
      setSelectedDays(pkg.schedule_days ? pkg.schedule_days.split(', ') : []);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        schedule_days: "",
        duration_weeks: 0,
        enrollment_fee: 0,
        periodic_fee: 0,
        periodic_frequency: "mensual",
        payment_day_spec: "",
        total_fee: 0,
        discount_percentage: 0,
        min_age: 0,
        max_age: 0,
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        capacity: 0
      });
      setSelectedDays([]);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updatePackage(editingId, formData);
        toast.success("Paquete actualizado");
      } else {
        await createPackage(formData);
        toast.success("Paquete creado");
      }
      setIsDialogOpen(false);
      loadPackages();
    } catch (error) {
      console.error("Failed to save package", error);
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este paquete?")) {
      try {
        await deletePackage(id);
        toast.success("Paquete eliminado");
        loadPackages();
      } catch (error) {
        console.error("Failed to delete package", error);
        toast.error("Error al eliminar");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <Link href="/academic" className="p-2.5 mt-1 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                </div>
                Programas y Paquetes
              </h1>
              <p className="mt-2 text-slate-500 max-w-2xl">
                Configura los paquetes de inscripción, precios, y horarios ofrecidos.
              </p>
            </div>
          </div>
          
          <Button onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md px-6 py-6 h-auto">
            <Plus className="mr-2 h-5 w-5" /> Nuevo Paquete
          </Button>
        </div>

        {/* Loading / Empty / Grid States */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <div className="mb-4 rounded-full bg-indigo-50 p-4">
              <Package className="h-10 w-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No hay paquetes</h3>
            <p className="mb-6 mt-2 max-w-md text-slate-500">
              Comienza creando tu primer paquete de suscripción.
            </p>
            <Button onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Crear Paquete
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="group overflow-hidden rounded-2xl border-slate-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 pb-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1">{pkg.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1.5 font-medium text-indigo-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-lg">${pkg.total_fee}</span>
                        <span className="text-sm font-normal text-slate-500">Total</span>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pkg)} className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id as number)} className="h-8 w-8 text-slate-500 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {pkg.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Duración</span>
                        <span className="font-medium text-slate-700">{pkg.duration_weeks} sem</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Días</span>
                        <span className="font-medium text-slate-700 truncate max-w-[80px]" title={pkg.schedule_days}>{pkg.schedule_days || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Users className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Cupo</span>
                        <span className="font-medium text-slate-700">{pkg.capacity || 'Ilimitado'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Edades</span>
                        <span className="font-medium text-slate-700">{pkg.min_age}-{pkg.max_age} años</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl sm:max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-0 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {editingId ? "Editar Programa" : "Nuevo Programa"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                Configura los detalles, fechas, horarios y costos del programa académico.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 px-8 py-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Package className="w-4 h-4"/> Información General</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-semibold">Nombre del Programa</Label>
                      <Input id="name" name="name" value={formData.name ?? ''} onChange={handleChange} placeholder="Ej. Refuerzo de Verano 2026" className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-semibold">Descripción</Label>
                      <Textarea id="description" name="description" value={formData.description ?? ''} onChange={handleChange} placeholder="Describe el programa..." className="resize-none h-28 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-8"><Users className="w-4 h-4"/> Restricciones</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_age" className="font-semibold">Edad Mínima</Label>
                      <Input id="min_age" name="min_age" type="number" min="0" value={formData.min_age ?? 0} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_age" className="font-semibold">Edad Máxima</Label>
                      <Input id="max_age" name="max_age" type="number" min="0" value={formData.max_age ?? 0} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="capacity" className="font-semibold">Cupo Máximo <span className="text-slate-400 font-normal">(0 = Ilimitado)</span></Label>
                    <Input id="capacity" name="capacity" type="number" min="0" value={formData.capacity ?? 0} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Horario</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Días de Clase</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DAYS_OF_WEEK.map(day => {
                          const isSelected = selectedDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 shadow-md scale-105' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                              }`}
                            >
                              {day.substring(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="start_time" className="font-semibold">Hora Inicio</Label>
                        <Input id="start_time" name="start_time" type="time" value={formData.start_time ?? ''} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_time" className="font-semibold">Hora Fin</Label>
                        <Input id="end_time" name="end_time" type="time" value={formData.end_time ?? ''} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-8"><CalendarDays className="w-4 h-4"/> Fechas y Costos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="font-semibold">Fecha Inicio</Label>
                      <Input id="start_date" name="start_date" type="date" value={formData.start_date ?? ''} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="font-semibold">Fecha Fin</Label>
                      <Input id="end_date" name="end_date" type="date" value={formData.end_date ?? ''} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_weeks" className="font-semibold">Semanas</Label>
                      <Input id="duration_weeks" name="duration_weeks" type="number" min="0" value={formData.duration_weeks ?? 0} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="enrollment_fee" className="font-semibold">Inscripción ($)</Label>
                      <Input id="enrollment_fee" name="enrollment_fee" type="number" min="0" value={formData.enrollment_fee ?? 0} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="periodic_fee" className="font-semibold">Periódico ($)</Label>
                      <Input id="periodic_fee" name="periodic_fee" type="number" min="0" value={formData.periodic_fee ?? 0} onChange={handleChange} className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="periodic_frequency" className="font-semibold">Frecuencia de Cobro</Label>
                      <select id="periodic_frequency" name="periodic_frequency" value={formData.periodic_frequency ?? 'mensual'} onChange={handleChange} className="flex h-11 w-full rounded-md border bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                        <option value="semanal">Semanal</option>
                        <option value="quincenal">Quincenal</option>
                        <option value="mensual">Mensual</option>
                        <option value="unico">Único</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_day_spec" className="font-semibold">Día de Cobro</Label>
                      {formData.periodic_frequency === 'semanal' ? (
                        <select id="payment_day_spec" name="payment_day_spec" value={formData.payment_day_spec ?? ''} onChange={handleChange} className="flex h-11 w-full rounded-md border bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                          <option value="">Seleccionar día...</option>
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sábado">Sábado</option>
                          <option value="Domingo">Domingo</option>
                        </select>
                      ) : formData.periodic_frequency === 'quincenal' ? (
                        <select id="payment_day_spec" name="payment_day_spec" value={formData.payment_day_spec ?? ''} onChange={handleChange} className="flex h-11 w-full rounded-md border bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                          <option value="">Seleccionar días...</option>
                          <option value="1 y 15">1 y 15</option>
                          <option value="15 y 30">15 y 30</option>
                          <option value="15 y último">15 y último del mes</option>
                        </select>
                      ) : formData.periodic_frequency === 'mensual' ? (
                        <Input id="payment_day_spec" name="payment_day_spec" type="number" min="1" max="31" value={formData.payment_day_spec ?? ''} onChange={handleChange} placeholder="Día del mes (ej. 1, 15, 30)" className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11" />
                      ) : (
                        <Input id="payment_day_spec" name="payment_day_spec" value={formData.payment_day_spec ?? ''} onChange={handleChange} placeholder="N/A" disabled className="bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-11 cursor-not-allowed" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 px-6 font-semibold">Cancelar</Button>
              <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl h-11 px-8 font-semibold shadow-md">
                {editingId ? "Guardar Cambios" : "Crear Programa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
