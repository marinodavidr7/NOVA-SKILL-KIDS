import { getClassroomById, updateClassroom } from '@/lib/actions/classrooms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, School, Save, Settings, Hash } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function EditClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classroomId = parseInt(id);
  const classroom = await getClassroomById(classroomId);

  if (!classroom) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/classrooms/${classroomId}`}>
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <School className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Aula</h1>
            <p className="text-sm text-muted-foreground">Actualiza la configuración y detalles del grupo.</p>
          </div>
        </div>
      </div>

      <form action={updateClassroom} className="space-y-6">
        <input type="hidden" name="id" value={classroomId} />
        
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50 pb-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Settings className="h-5 w-5" />
              <CardTitle className="text-lg">Configuración del Aula</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Nombre del Aula <span className="text-red-500">*</span></Label>
                <Input name="name" required defaultValue={classroom.name} className="h-11 rounded-xl shadow-sm" placeholder="Ej. Sala Mariposas, Grupo A..." />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Hash className="h-4 w-4 text-amber-600" />
                  Capacidad Máxima <span className="text-red-500">*</span>
                </Label>
                <Input type="number" name="capacity" required defaultValue={classroom.capacity} min="1" className="h-11 rounded-xl shadow-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Rango de Edades (Años) <span className="text-red-500">*</span></Label>
                <div className="flex items-center gap-2">
                  <Input type="number" name="minAge" required defaultValue={classroom.minAge} min="0" max="10" className="h-11 rounded-xl shadow-sm text-center" />
                  <span className="text-slate-400 font-bold">a</span>
                  <Input type="number" name="maxAge" required defaultValue={classroom.maxAge} min="0" max="10" className="h-11 rounded-xl shadow-sm text-center" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Descripción (Opcional)</Label>
                <Input name="description" defaultValue={classroom.description} className="h-11 rounded-xl shadow-sm" placeholder="Detalles sobre el espacio o grupo..." />
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/classrooms/${classroomId}`}>
            <Button type="button" variant="outline" className="rounded-xl px-6 h-11 border-slate-200 text-slate-600 hover:bg-slate-50">Cancelar</Button>
          </Link>
          <Button 
            type="submit" 
            className="h-11 gap-2 rounded-xl px-8 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition-all duration-300 font-semibold text-white"
          >
            <Save className="h-5 w-5" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
