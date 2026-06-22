import { getStaffById } from "@/lib/actions/staff";
import { getDocumentsByEntity } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Briefcase, CalendarDays, WalletCards, ShieldAlert, FileText, GraduationCap } from "lucide-react";
import EntityDocumentsCard from "@/components/documents/EntityDocumentsCard";

export default async function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staffId = parseInt(id);
  const data = await getStaffById(staffId);

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Empleado no encontrado</div>;
  }

  const documents = await getDocumentsByEntity('Personal', staffId);
  const initials = `${(data.firstName?.[0] || "").toUpperCase()}${(data.lastName?.[0] || "").toUpperCase()}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Actions */}
      <div className="flex items-center justify-between">
        <Link href="/staff">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Volver a Nómina
          </Button>
        </Link>
        <Link href={`/staff/edit/${data.id}`}>
          <Button variant="outline" size="sm" className="gap-2 shadow-sm rounded-xl">
            <Edit className="h-4 w-4" />
            Editar Empleado
          </Button>
        </Link>
      </div>

      {/* Main Profile Header */}
      <Card className="border-0 shadow-md bg-white overflow-hidden rounded-2xl relative">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
        <CardContent className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-12">
            <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl rounded-2xl bg-white">
              {data.photoUrl && <AvatarImage src={data.photoUrl} alt={`${data.firstName} ${data.lastName}`} className="object-cover" />}
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 text-4xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-800">{data.firstName} {data.lastName}</h2>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${data.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {data.status === 'active' ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4"/> DNI: {data.dni || 'No registrado'}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4"/> {data.role}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Contact & Employment Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-0 shadow-sm border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Phone className="h-5 w-5" />
                <span>Contacto Personal</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono</p>
                <p className="font-medium text-slate-800 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">{data.phone || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</p>
                <p className="font-medium text-slate-800">{data.email || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dirección Física</p>
                <p className="font-medium text-slate-800">{data.address || 'No registrada'}</p>
              </div>
              {data.birthDate && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de Nacimiento</p>
                  <p className="font-medium text-slate-800">{new Date(data.birthDate).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-t-4 border-t-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold">
                <CalendarDays className="h-5 w-5" />
                <span>Datos Laborales</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de Ingreso</p>
                <p className="font-medium text-slate-800">{data.hireDate ? new Date(data.hireDate).toLocaleDateString() : 'No registrada'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Salario Base</p>
                <p className="font-bold text-slate-800 text-lg">${(data.salary || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {(data.degree || data.institution || data.specialties) && (
            <Card className="border-0 shadow-sm border-t-4 border-t-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <GraduationCap className="h-5 w-5" />
                  <span>Datos Académicos</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Título / Grado</p>
                  <p className="font-medium text-slate-800">{data.degree || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Institución Educativa</p>
                  <p className="font-medium text-slate-800">{data.institution || 'No registrada'}</p>
                </div>
                {data.graduationYear && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Año de Graduación</p>
                    <p className="font-medium text-slate-800">{data.graduationYear}</p>
                  </div>
                )}
                {data.specialties && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Especialidades</p>
                    <p className="font-medium text-slate-800">{data.specialties}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(data.bankName || data.bankAccount) && (
            <Card className="border-0 shadow-sm border-t-4 border-t-indigo-500">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <WalletCards className="h-5 w-5" />
                  <span>Información Bancaria</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Banco</p>
                  <p className="font-medium text-slate-800">{data.bankName || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cuenta / Nómina</p>
                  <p className="font-medium text-slate-800">{data.bankAccount || 'No registrada'}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {(data.emergencyName || data.emergencyPhone) && (
            <Card className="border-0 shadow-sm border-t-4 border-t-rose-500">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <ShieldAlert className="h-5 w-5" />
                  <span>Contacto de Emergencia</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre</p>
                  <p className="font-medium text-slate-800">{data.emergencyName || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Relación</p>
                  <p className="font-medium text-slate-800">{data.emergencyRelation || 'No registrada'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono</p>
                  <p className="font-medium text-slate-800 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">{data.emergencyPhone || 'No registrado'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Documents */}
        <div className="lg:col-span-2 space-y-6">
          <EntityDocumentsCard 
            documents={documents} 
            entityType="Personal" 
            entityId={staffId} 
            categoryId={3} // Categoría ID para Recursos Humanos/Personal
            entityName={`${data.firstName} ${data.lastName}`} 
            role={data.role} // PASAMOS EL ROLE PARA LOS REQUISITOS (Ej. Chofer)
          />
        </div>
      </div>
    </div>
  );
}
