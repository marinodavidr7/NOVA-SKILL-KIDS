import { getChild, getSiblings } from "@/lib/actions/children";
import { getMedicalRecordsByChild } from "@/lib/actions/medical";
import { getDocumentsByEntity, getCategories } from "@/lib/actions/documents";
import { getEvalTemplates } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowLeft, Baby, Edit, Phone, Mail, MapPin, HeartPulse, ShieldAlert, FileText, User, FileDown, Users, GraduationCap, PlusCircle } from "lucide-react";
import MedicalRecordsTab from "@/components/children/MedicalRecordsTab";
import EntityDocumentsCard from "@/components/documents/EntityDocumentsCard";
import ObservationsModal from "@/components/children/ObservationsModal";
import ChildSubscriptionsCard from "@/components/children/ChildSubscriptionsCard";
import { getChildSubscriptions, getChildIncomes, getPackages } from "@/lib/actions/subscriptions";

export default async function ChildProfilePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ from?: string }> }) {
  const { id } = await params;
  const { from } = await searchParams;
  const childId = parseInt(id);
  const data = await getChild(childId);
  const siblings = await getSiblings(childId);
  const initialRecords = await getMedicalRecordsByChild(childId);
  const documents = await getDocumentsByEntity('Estudiantes', childId);
  const templates = await getEvalTemplates();
  
  const categories = await getCategories();
  const category = categories.find((c: any) => c.name === 'Estudiantes');

  const subscriptions = await getChildSubscriptions(childId);
  const incomes = await getChildIncomes(childId);
  const availablePackages = await getPackages() as any;

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Niño no encontrado</div>;
  }

  const birthDate = data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    suspended: 'bg-amber-100 text-amber-700',
    graduated: 'bg-slate-100 text-slate-700'
  };

  const statusText: Record<string, string> = {
    active: 'Activo',
    suspended: 'Suspendido',
    graduated: 'Egresado'
  };

  const mainTutor = data.parents[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header and Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={from || "/children"}>
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Expediente del Menor</h1>
              <p className="text-sm text-muted-foreground">Vista detallada de la información y registros.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/children/${childId}/report`} target="_blank">
            <Button variant="outline" className="gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
              <FileDown className="h-4 w-4" />
              Generar PDF
            </Button>
          </Link>
          <Link href={`/children/${childId}/edit`}>
            <Button variant="outline" className="gap-2 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50">
              <Edit className="h-4 w-4" />
              Editar Registro
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Profile Header */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden relative">
        <div className="h-32 w-full relative overflow-hidden bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500">
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <pattern id="kids-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M15 15l5-5 5 5-5 5z" fill="#ffffff" opacity="0.8"/>
              <circle cx="45" cy="15" r="4" fill="#ffffff" opacity="0.6"/>
              <path d="M15 45q5-5 10 0t10 0" stroke="#ffffff" fill="none" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              <circle cx="45" cy="45" r="6" fill="#ffffff" opacity="0.7"/>
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#kids-pattern)"></rect>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
        <CardContent className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-12">
            <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl rounded-2xl bg-white">
              <AvatarImage src={data.photoUrl || ''} className="object-cover rounded-2xl" />
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 text-4xl font-bold">
                {data.firstName[0]}{data.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-800">{data.firstName} {data.lastName}</h2>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[data.status] || statusColors['active']}`}>
                  {statusText[data.status] || 'Activo'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><Baby className="h-4 w-4" /> {age} años</span>
                <span className="flex items-center gap-1.5">ID: #{String(data.id).padStart(4, '0')}</span>
                <span>Aula: {data.classroomName || 'Sin asignar'}</span>
                <span>{data.gender === 'male' ? 'Masculino' : data.gender === 'female' ? 'Femenino' : 'No especificado'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Medical & Emergency */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-0 shadow-md bg-gradient-to-br from-rose-50 to-red-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl"></div>
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center gap-3 text-rose-700 font-black text-lg border-b border-rose-200/60 pb-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shadow-sm">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span>Contactos de Emergencia</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 text-sm relative z-10">

              {/* Structured data parsed from notes or real columns */}
              {(() => {
                const notes = data.medical?.notes || '';
                const bloodType = data.medical?.bloodType || notes.match(/Tipo de Sangre:\s*(.+)/)?.[1]?.trim() || 'No especificado';
                const authorized = data.medical?.authorizedPickup || notes.match(/Personas Autorizadas para Recogida:\s*(.+)/)?.[1]?.trim() || 'Solo tutores';
                
                let emergency = null;
                if (data.medical?.emergencyContactName) {
                  emergency = `${data.medical.emergencyContactName} (${data.medical.emergencyContactPhone || 'Sin teléfono'})`;
                } else {
                  emergency = notes.match(/Contacto de Emergencia Alterno:\s*(.+)/)?.[1]?.trim();
                }
                
                return (
                  <div className="space-y-3">
                    {/* Blood Type */}
                    <div className="flex items-center gap-3 bg-white/70 rounded-xl p-3 border border-rose-100 shadow-sm">
                      <div className="flex-shrink-0 w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center">
                        <span className="text-rose-600 font-black text-sm">🩸</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest">Tipo de Sangre</p>
                        <p className="font-bold text-slate-800 text-sm truncate">{bloodType}</p>
                      </div>
                    </div>

                    {/* Authorized Pickup */}
                    <div className="bg-white/70 rounded-xl p-3 border border-rose-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">🛡️</span>
                        <p className="text-[10px] font-bold text-rose-500/70 uppercase tracking-widest">Personas Autorizadas</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {authorized.split(',').map((person: string, i: number) => (
                          <span key={i} className="inline-flex items-center bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-100">
                            {person.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {emergency && (
                      <div className="flex items-center gap-3 bg-amber-50/80 rounded-xl p-3 border border-amber-100 shadow-sm">
                        <div className="flex-shrink-0 w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-amber-600 font-black text-sm">📞</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest">Emergencia Alterno</p>
                          {(() => {
                            const match = emergency.match(/(.+?)\s*[\(\-]([0-9\-\s]+)[\)]?/);
                            if (match) {
                              return (
                                <>
                                  <p className="font-bold text-slate-800 text-sm truncate">{match[1].trim()}</p>
                                  <p className="font-medium text-slate-600 text-xs truncate">{match[2].trim()}</p>
                                </>
                              );
                            }
                            return <p className="font-bold text-slate-800 text-sm break-words">{emergency}</p>;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Tutors and Info */}
        <div className="space-y-6 lg:col-span-2">
          
          <Card className="border-0 shadow-sm border-t-4 border-t-emerald-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <User className="h-5 w-5" />
                <span>Tutor Principal y Familia</span>
              </div>
            </CardHeader>
            <CardContent>
              {mainTutor ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{mainTutor.firstName} {mainTutor.lastName}</h3>
                      <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex mt-1">{mainTutor.relationship}</p>
                    </div>
                  </div>
                  
                  {(() => {
                    // Parse cédula out of address if stored together
                    const rawAddress = mainTutor.address || '';
                    const cedulaMatch = rawAddress.match(/\(Cédula:\s*([^)]+)\)/);
                    const cedula = cedulaMatch ? cedulaMatch[1].trim() : null;
                    const cleanAddress = rawAddress.replace(/\s*\(Cédula:[^)]*\)/, '').trim();

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><Phone className="h-4 w-4"/></div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Teléfono Móvil</p>
                            <p className="font-medium text-slate-700">{mainTutor.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><Mail className="h-4 w-4"/></div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Correo Electrónico</p>
                            <p className="font-medium text-slate-700">{mainTutor.email || 'No especificado'}</p>
                          </div>
                        </div>
                        {cedula && (
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><FileText className="h-4 w-4"/></div>
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase">Cédula de Identidad</p>
                              <p className="font-medium text-slate-700">{cedula}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><MapPin className="h-4 w-4"/></div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Dirección Residencial</p>
                            <p className="font-medium text-slate-700">{cleanAddress || 'No especificada'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No hay tutor registrado.</p>
              )}
            </CardContent>
          </Card>



          {siblings.length > 0 && (
            <Card className="border-0 shadow-sm border-t-4 border-t-indigo-400">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <Users className="h-5 w-5" />
                  <span>Familiares en Nova Skill Kids</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {siblings.map((sibling: any) => {
                    let sharedRel = "Familiar";
                    const rel1 = sibling.current_child_relation?.toLowerCase() || '';
                    const rel2 = sibling.relation_to_parent?.toLowerCase() || '';

                    if ((rel1 === 'padre' || rel1 === 'madre') && (rel2 === 'padre' || rel2 === 'madre')) {
                      sharedRel = "Hermano/a";
                    } else if (rel1 === 'tío/a' || rel2 === 'tío/a') {
                      sharedRel = "Primo/a";
                    } else if (rel1 === 'abuelo/a' || rel2 === 'abuelo/a') {
                      sharedRel = "Tutoría Compartida (Abuelos)";
                    } else if (rel1 === 'tutor legal' || rel2 === 'tutor legal') {
                      sharedRel = "Comparten Tutor Legal";
                    }

                    return (
                      <Link key={sibling.id} href={`/children/${sibling.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group bg-white shadow-sm">
                          <Avatar className="h-10 w-10 border-2 border-indigo-100 group-hover:border-indigo-300 transition-colors">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                              {sibling.firstName[0]}{sibling.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                              {sibling.firstName} {sibling.lastName}
                            </p>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                              <Baby className="h-3 w-3" />
                              {sharedRel}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      <div className="space-y-6 mt-6">
        <Card className="border-0 shadow-sm border-t-4 border-t-blue-500">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <GraduationCap className="h-5 w-5" />
              <span>Expediente Académico y Desarrollo</span>
            </div>
            <Link href={`/education/evaluations/new?childId=${data.id}`}>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-600 hover:bg-blue-50">
                <PlusCircle className="h-4 w-4" />
                Añadir Evaluación
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.evaluations && data.evaluations.length > 0 ? (() => {
              const sortedEvals = [...data.evaluations].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const parsedEvals = sortedEvals.map(ev => {
                let res = {};
                try {
                  res = typeof ev.results === 'string' ? JSON.parse(ev.results) : ev.results;
                } catch(e) {}
                return { ...ev, parsedResults: res };
              });

              return (
                <div className="space-y-6">
                  {templates.map((area: any) => {
                    const hasData = parsedEvals.some(ev => {
                      const areaRes = ev.parsedResults?.[area.id];
                      return areaRes && Object.values(areaRes).some(v => v);
                    });
                    if (!hasData) return null;

                    return (
                      <div key={area.id} className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden mb-6">
                        <div className="bg-indigo-50/50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                          <h4 className="font-bold text-indigo-900 text-sm">{area.name}</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 w-1/3 min-w-[200px]">Indicador</th>
                                {parsedEvals.map(ev => (
                                  <th key={ev.id} className="px-4 py-3 min-w-[120px] text-center border-l border-slate-200">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      <span className="text-slate-800 font-bold">{new Date(ev.date).toLocaleDateString()}</span>
                                      <Link href={`/education/evaluations/${ev.id}/edit`}>
                                        <span className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer">
                                          <Edit className="w-3 h-3" /> Editar
                                        </span>
                                      </Link>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {area.indicators.map((indicator: string, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-slate-700">{indicator}</td>
                                  {parsedEvals.map(ev => {
                                    const score = ev.parsedResults?.[area.id]?.[indicator];
                                    let dotClass = "bg-slate-300";
                                    let scoreClass = "text-slate-500 bg-slate-50";
                                    const displayScore = score || "-";
                                    
                                    if (score === 'Logrado') { dotClass = "bg-emerald-500"; scoreClass = "text-emerald-700 bg-emerald-50 border-emerald-200"; }
                                    else if (score === 'En Proceso') { dotClass = "bg-amber-400"; scoreClass = "text-amber-700 bg-amber-50 border-amber-200"; }
                                    else if (score === 'No Logrado') { dotClass = "bg-rose-500"; scoreClass = "text-rose-700 bg-rose-50 border-rose-200"; }
                                    
                                    return (
                                      <td key={ev.id} className="px-4 py-3 text-center border-l border-slate-100">
                                        {score ? (
                                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${scoreClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                                            {displayScore}
                                          </span>
                                        ) : (
                                          <span className="text-slate-300">-</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  <ObservationsModal parsedEvals={parsedEvals} />
                </div>
              );
            })() : (
              <div className="text-center py-6 text-slate-500 text-sm">
                <GraduationCap className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                No hay evaluaciones académicas registradas para este menor.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-amber-600 font-bold">
              <ShieldAlert className="h-5 w-5" />
              <span>Autorizaciones de Recogida y Emergencias</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-800 font-medium leading-relaxed">
                Solo las personas especificadas en las notas médicas (o tutores vinculados con permiso explícito) están autorizadas para retirar a este menor de las instalaciones. En caso de emergencia, contactar inmediatamente a los números indicados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChildSubscriptionsCard childId={childId} subscriptions={subscriptions as any[]} incomes={incomes as any[]} availablePackages={availablePackages as any[]} />

      {/* Documents Section */}
      <EntityDocumentsCard 
        documents={documents} 
        entityType="Estudiantes" 
        entityId={childId}
        categoryId={category?.id}
        entityName={`${data.firstName} ${data.lastName}`}
      />

      {/* Medical Records Full Width Section */}
      <Card className="border-0 shadow-sm border-t-4 border-t-rose-500 mt-6">
        <CardContent className="p-6">
          <MedicalRecordsTab childId={childId} initialRecords={initialRecords} medicalProfile={data.medical} />
        </CardContent>
      </Card>
    </div>
  );
}
