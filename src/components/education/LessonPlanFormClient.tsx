'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLessonPlan } from '@/lib/actions/education';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  BookOpen, Calendar, Target, 
  PenTool, AlignLeft, Loader2, 
  ArrowLeft, Users, LayoutTemplate 
} from 'lucide-react';
import Link from 'next/link';

export default function LessonPlanFormClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await createLessonPlan(formData);
      toast.success('Planificación creada con éxito', {
        description: 'La nueva planificación educativa ha sido guardada.',
      });
      router.push('/education');
    } catch (error) {
      toast.error('Error al guardar', {
        description: 'Ocurrió un problema al intentar guardar la planificación.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/education" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Educación
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
              <LayoutTemplate className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Nueva Planificación
              </h1>
              <p className="text-muted-foreground">
                Diseña y estructura las actividades pedagógicas para tus alumnos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Info Principal */}
          <div className="md:col-span-5 space-y-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 transition-shadow hover:shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-violet-700 dark:text-violet-400">
                  <BookOpen className="h-5 w-5" />
                  Información General
                </CardTitle>
                <CardDescription>
                  Datos básicos de la sesión de clase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 font-medium">Título de la Actividad</Label>
                  <div className="relative">
                    <Input 
                      id="title" 
                      name="title" 
                      placeholder="Ej. Taller de Lectoescritura" 
                      required 
                      className="bg-muted/50 border-transparent focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-700 font-medium">Fecha Programada</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <Input 
                      id="date" 
                      type="date" 
                      name="date" 
                      required 
                      className="pl-9 bg-muted/50 border-transparent focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classroomId" className="text-slate-700 font-medium">ID de Aula <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </div>
                    <Input 
                      id="classroomId" 
                      type="number" 
                      name="classroomId" 
                      placeholder="Ej. 101"
                      className="pl-9 bg-muted/50 border-transparent focus:border-violet-500 focus:ring-violet-500/20 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Detalles Pedagógicos */}
          <div className="md:col-span-7 space-y-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 transition-shadow hover:shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-fuchsia-700 dark:text-fuchsia-400">
                  <Target className="h-5 w-5" />
                  Detalle Pedagógico
                </CardTitle>
                <CardDescription>
                  Define las metas, herramientas y desarrollo de la actividad.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                
                <div className="space-y-2">
                  <Label htmlFor="objectives" className="text-slate-700 font-medium">Objetivos de Aprendizaje</Label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground">
                      <Target className="h-4 w-4" />
                    </div>
                    <Input 
                      id="objectives" 
                      name="objectives" 
                      placeholder="¿Qué habilidades desarrollarán los niños?"
                      className="pl-9 bg-muted/50 border-transparent focus:border-fuchsia-500 focus:ring-fuchsia-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="materials" className="text-slate-700 font-medium">Materiales Requeridos</Label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground">
                      <PenTool className="h-4 w-4" />
                    </div>
                    <Input 
                      id="materials" 
                      name="materials" 
                      placeholder="Cartulinas, colores, bloques lógicos..."
                      className="pl-9 bg-muted/50 border-transparent focus:border-fuchsia-500 focus:ring-fuchsia-500/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">Desarrollo de la Actividad</Label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground">
                      <AlignLeft className="h-4 w-4" />
                    </div>
                    <textarea 
                      id="description" 
                      name="description" 
                      placeholder="Describe el paso a paso de la actividad..."
                      className="w-full min-h-[160px] pl-9 rounded-xl border-transparent bg-muted/50 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-fuchsia-500 focus-visible:ring-2 focus-visible:ring-fuchsia-500/20 resize-y" 
                    />
                  </div>
                </div>
                
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/education">
                <Button variant="ghost" type="button" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-xl gap-2 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Planificación'
                )}
              </Button>
            </div>
            
          </div>
        </div>
      </form>
    </div>
  );
}
