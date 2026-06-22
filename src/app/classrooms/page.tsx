import { getClassrooms } from "@/lib/actions/classrooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { School, PlusCircle, Users, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth";

export default async function ClassroomsPage() {
  const classrooms = await getClassrooms();
  const user = await getCurrentUser();
  const canCreateClassroom = user?.role === 'admin' || user?.permissions?.createClassroom;

  const totalCapacity = classrooms.reduce((sum: number, c: any) => sum + (c.capacity || 0), 0);
  const totalOccupancy = classrooms.reduce((sum: number, c: any) => sum + (c.currentOccupancy || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <School className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Aulas</h1>
            <p className="text-sm text-slate-500 mt-1">
              Administra los grupos, capacidades y asigna los niños a cada aula.
            </p>
          </div>
        </div>
        {canCreateClassroom && (
          <Link href="/classrooms/new">
            <Button className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 rounded-xl text-white">
              <PlusCircle className="h-4 w-4" />
              Crear Nueva Aula
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Total de Aulas</p>
                <p className="text-3xl font-black text-amber-900 mt-2">{classrooms.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <School className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Capacidad Total</p>
                <p className="text-3xl font-black text-blue-900 mt-2">{totalCapacity} <span className="text-lg font-medium text-blue-600">niños</span></p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Niños Asignados</p>
                <p className="text-3xl font-black text-emerald-900 mt-2">{totalOccupancy}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-gray-50 border-t-4 border-t-slate-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Plazas Libres</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{totalCapacity - totalOccupancy}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {classrooms.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <School className="h-16 w-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">No hay aulas registradas</h2>
            <p className="text-slate-500 max-w-md">
              Crea tu primera aula para poder organizar a los niños por grupos de edad.
            </p>
            <Link href="/classrooms/new" className="mt-6">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">Crear Aula</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((room: any) => {
            const percentage = room.capacity > 0 ? Math.round((room.currentOccupancy / room.capacity) * 100) : 0;
            const isFull = room.currentOccupancy >= room.capacity;
            
            return (
              <Card key={room.id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group">
                <div className={`h-2 ${isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{room.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{room.description || 'Sin descripción'}</p>
                      </div>
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                        <School className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Edades</span>
                        <span className="font-semibold text-slate-700">{room.minAge} a {room.maxAge} años</span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-slate-500 font-medium">Ocupación</span>
                          <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-slate-700'}`}>
                            {room.currentOccupancy} / {room.capacity}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-amber-500'}`} 
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 border-t border-slate-100">
                    <Link href={`/classrooms/${room.id}`}>
                      <Button className="w-full rounded-xl bg-white hover:bg-slate-100 text-amber-700 border border-amber-200 hover:border-amber-300 transition-colors">
                        Ver Niños y Gestionar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
