import { getAllActiveMedicalRecords, getChildrenWithAllergies } from "@/lib/actions/medical";
import { getChildren } from "@/lib/actions/children";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HeartPulse, Clock, Thermometer, Pill, AlertTriangle, Syringe, Ban, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NewMedicalRecordButton from "@/components/health/NewMedicalRecordButton";

export default async function GlobalHealthPage() {
  const records = await getAllActiveMedicalRecords();
  const childrenWithAllergies = await getChildrenWithAllergies();
  const children = await getChildren();

  const getTypeInfo = (type: string) => {
    switch(type) {
      case 'fiebre': return { icon: Thermometer, color: 'text-rose-500', bg: 'bg-rose-100', label: 'Fiebre' };
      case 'enfermedad': return { icon: HeartPulse, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Enfermedad' };
      case 'golpe': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Golpe / Lesión' };
      case 'alergia': return { icon: Ban, color: 'text-red-500', bg: 'bg-red-100', label: 'Reacción Alérgica' };
      case 'medicamento': return { icon: Pill, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Medicamento' };
      default: return { icon: Syringe, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Otro' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shadow-sm">
              <HeartPulse className="h-6 w-6" />
            </div>
            Salud y Enfermería
          </h1>
          <p className="text-muted-foreground mt-2">Monitoreo de incidencias de salud activas en Nova Skill Kids.</p>
        </div>
        <NewMedicalRecordButton childrenList={children} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {records.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed shadow-sm">
            <HeartPulse className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">¡Todo está excelente!</h3>
            <p className="text-slate-500 mt-1">No hay casos médicos ni niños enfermos reportados actualmente.</p>
          </div>
        ) : (
          records.map(record => {
            const info = getTypeInfo(record.type);
            const TypeIcon = info.icon;
            
            return (
              <Card key={record.id} className="overflow-hidden border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-1.5 w-full ${info.bg.replace('100', '400')}`}></div>
                <CardHeader className="pb-3 pt-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${info.bg}`}>
                        <TypeIcon className={`h-4 w-4 ${info.color}`} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{info.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold bg-slate-50 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      {record.date} {record.time}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                      <AvatarImage src={record.childPhotoUrl || ''} />
                      <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">
                        {record.childFirstName?.[0]}{record.childLastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {record.childFirstName} {record.childLastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        Aula: {record.classroomName || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-700 font-medium bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                    {record.description}
                  </p>
                  
                  <div className="pt-2 flex justify-end">
                    <Link href={`/children/${record.childId}`}>
                      <button className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                        Ver Expediente <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {childrenWithAllergies.length > 0 && (
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Ban className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-bold text-slate-800">Niños con Alergias Registradas</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {childrenWithAllergies.map(child => (
              <Card key={child.id} className="overflow-hidden border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-1.5 w-full bg-red-400"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src={child.photoUrl || ''} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                        {child.firstName?.[0]}{child.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {child.firstName} {child.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {child.classroomName || 'Sin aula'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                    <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-1">Alergias</p>
                    <p className="text-xs font-semibold text-red-900 leading-snug">
                      {child.allergies}
                    </p>
                  </div>
                  
                  <div className="pt-1 flex justify-end">
                    <Link href={`/children/${child.id}`}>
                      <button className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                        Ver Expediente <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
