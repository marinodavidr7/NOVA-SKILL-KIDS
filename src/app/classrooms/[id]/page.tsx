import { getClassroomById, assignChildToClassroom, removeChildFromClassroom, deleteClassroom } from '@/lib/actions/classrooms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { ArrowLeft, School, Users, UserMinus, PlusCircle, Baby, AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import { getCurrentUser } from '@/lib/actions/auth';

export default async function ClassroomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classroomId = parseInt(id);
  const data = await getClassroomById(classroomId);

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Aula no encontrada</div>;
  }

  const user = await getCurrentUser();
  const canAssignChild = user?.role === 'admin' || user?.permissions?.assignChild;
  const canRemoveChild = user?.role === 'admin' || user?.permissions?.removeChild;
  const canEditClassroom = user?.role === 'admin' || user?.permissions?.editClassroom;
  const canDeleteClassroom = user?.role === 'admin' || user?.permissions?.deleteClassroom;

  const isFull = data.children.length >= data.capacity;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/classrooms">
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <School className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Capacidad: {data.children.length} / {data.capacity} niños ({data.minAge}-{data.maxAge} años)
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canEditClassroom && (
            <Link href={`/classrooms/${classroomId}/edit`}>
              <Button variant="outline" className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <Edit className="h-4 w-4" />
                Editar Aula
              </Button>
            </Link>
          )}
          {canDeleteClassroom && (
            <form action={deleteClassroom}>
              <input type="hidden" name="id" value={classroomId} />
              <Button type="submit" variant="destructive" className="gap-2 rounded-xl shadow-lg shadow-rose-500/20 transition-all hover:shadow-rose-500/30">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Children in Classroom */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm border-t-4 border-t-amber-500">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Users className="h-5 w-5 text-amber-600" />
                <span>Niños Asignados a esta Aula</span>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isFull ? 'Aula Llena' : `${data.capacity - data.children.length} cupos disponibles`}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.children.length === 0 ? (
                <div className="text-center py-10">
                  <Baby className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No hay niños asignados a esta aula aún.</p>
                  <p className="text-sm text-slate-400 mt-1">Utiliza el panel derecho para agregar niños.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.children.map((child: any) => {
                      const age = new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear();
                      return (
                        <TableRow key={child.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                <AvatarImage src={child.photoUrl} alt={child.firstName} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                                  {child.firstName[0]}{child.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-800">{child.firstName} {child.lastName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">{age} años</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/children/${child.id}?from=/classrooms/${classroomId}`}>
                                <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 px-2 h-8">
                                  <Eye className="h-4 w-4 mr-1.5" />
                                  <span className="text-xs font-semibold">Ver</span>
                                </Button>
                              </Link>
                              {canRemoveChild && (
                                <form action={removeChildFromClassroom.bind(null, child.id, classroomId)}>
                                  <Button type="submit" variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 px-2 h-8">
                                    <UserMinus className="h-4 w-4 mr-1.5" />
                                    <span className="text-xs font-semibold">Remover</span>
                                  </Button>
                                </form>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Add Child Form */}
        {canAssignChild && (
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-sm border-t-4 border-t-blue-500">
            <CardHeader className="bg-blue-50/30 pb-4">
              <div className="flex items-center gap-2 text-blue-800 font-bold">
                <PlusCircle className="h-5 w-5" />
                <span>Asignar Niño</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isFull ? (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3 text-rose-800">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold">Capacidad Máxima Alcanzada</p>
                    <p className="mt-1 opacity-90">No puedes asignar más niños a esta aula a menos que liberes cupos o aumentes su capacidad.</p>
                  </div>
                </div>
              ) : data.availableChildren.length === 0 ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
                  No hay niños disponibles para asignar. Todos los niños activos ya están en un aula.
                </div>
              ) : (
                <form action={assignChildToClassroom} className="space-y-4">
                  <input type="hidden" name="classroomId" value={classroomId} />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selecciona niño(s)</label>
                    <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl bg-white p-2 space-y-1 shadow-sm">
                      {data.availableChildren.map((c: any) => {
                        const age = new Date().getFullYear() - new Date(c.dateOfBirth).getFullYear();
                        return (
                          <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              name="childId" 
                              value={c.id} 
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {c.firstName} {c.lastName} <span className="text-slate-400 font-normal">({age} años)</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm">
                    Agregar al Aula
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        )}

      </div>
    </div>
  );
}
