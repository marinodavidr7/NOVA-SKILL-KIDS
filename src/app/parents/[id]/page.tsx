import { getParentById } from "@/lib/actions/parents";
import { getDocumentsByEntity } from "@/lib/actions/documents";
import { getReportsByParent, getEventsForDropdown } from "@/lib/actions/parentReports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Users, Baby, AlertTriangle, ShieldCheck } from "lucide-react";
import EntityDocumentsCard from "@/components/documents/EntityDocumentsCard";
import ParentReportsCard from "@/components/parents/ParentReportsCard";

export default async function ParentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parentId = parseInt(id);
  const data = await getParentById(parentId);

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Padre/Tutor no encontrado</div>;
  }

  const [documents, reports, events] = await Promise.all([
    getDocumentsByEntity('Padres', parentId),
    getReportsByParent(parentId),
    getEventsForDropdown()
  ]);

  const initials = `${(data.firstName?.[0] || "").toUpperCase()}${(data.lastName?.[0] || "").toUpperCase()}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header and Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/parents">
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Expediente del Tutor</h1>
              <p className="text-sm text-muted-foreground">Información de contacto y menores a cargo.</p>
            </div>
          </div>
        </div>
        <Link href={`/parents/${parentId}/edit`}>
          <Button variant="outline" className="gap-2 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
            <Edit className="h-4 w-4" />
            Editar Registro
          </Button>
        </Link>
      </div>

      {/* Main Profile Header */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600"></div>
        <CardContent className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-12">
            <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl rounded-2xl bg-white">
              {data.photoUrl && <AvatarImage src={data.photoUrl} alt={`${data.firstName} ${data.lastName}`} className="object-cover rounded-2xl" />}
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 text-4xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-800">{data.firstName} {data.lastName}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5">ID: #{String(data.id).padStart(4, '0')}</span>
                <span>Inscrito: {new Date(data.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Contact Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-0 shadow-sm border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Phone className="h-5 w-5" />
                <span>Contacto Principal</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono Móvil</p>
                <p className="font-medium text-slate-800 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">{data.phone || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</p>
                <p className="font-medium text-slate-800">{data.email || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cédula / Identificación</p>
                <p className="font-medium text-slate-800">{data.cedula || 'No registrada'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dirección Residencial</p>
                <p className="font-medium text-slate-800">{data.address || 'No registrada'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Children Linked */}
        <div className="space-y-6 lg:col-span-2">
          
          <Card className="border-0 shadow-sm border-t-4 border-t-violet-500">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-violet-600 font-bold">
                <Baby className="h-5 w-5" />
                <span>Menores a su Cargo ({data.children ? data.children.length : 0})</span>
              </div>
              <Link href="/children/new">
                <Button size="sm" variant="outline" className="h-8 gap-1 rounded-lg text-violet-600 border-violet-200">
                  + Registrar Otro
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data.children && data.children.length > 0 ? (
                <div className="space-y-3">
                  {data.children.map((child: any) => (
                    <div key={child.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-violet-50 hover:border-violet-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                            {child.firstName[0]}{child.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{child.firstName} {child.lastName}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>{child.relationship}</span>
                            {child.isEmergencyContact ? (
                              <span className="flex items-center gap-0.5 text-rose-500" title="Contacto de Emergencia"><AlertTriangle className="h-3 w-3"/> Emergencia</span>
                            ) : null}
                            {child.isAuthorizedToPickup ? (
                              <span className="flex items-center gap-0.5 text-emerald-500" title="Autorizado para recoger"><ShieldCheck className="h-3 w-3"/> Recoge</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <Link href={`/children/${child.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-violet-600">Ver Expediente</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 mb-2">Este tutor no tiene menores asignados actualmente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">

          {/* Reuniones y Reportes */}
          <ParentReportsCard 
            reports={reports} 
            parentId={parentId} 
            events={events} 
          />

          {/* Documentos Asociados */}
          <EntityDocumentsCard 
            documents={documents} 
            entityType="Padres" 
            entityId={parentId} 
            categoryId={2} 
            entityName={`${data.firstName} ${data.lastName}`} 
          />
      </div>
    </div>
  );
}
