import { getDocumentStats } from '@/lib/actions/documents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileArchive, FileText, AlertTriangle, UserCheck, ShieldAlert, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DocumentsDashboard() {
  const stats = await getDocumentStats();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <FileArchive className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gestión Documental</h1>
            <p className="text-sm text-slate-500 mt-1">
              Expedientes digitales, políticas y control de versiones institucionales.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Docs</p>
                <p className="text-3xl font-black text-blue-900 dark:text-blue-50 mt-2">{stats.totalDocs}</p>
                <p className="text-xs font-semibold text-blue-700/70 mt-2">En bóveda digital</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Por Vencer (30d)</p>
                <p className="text-3xl font-black text-amber-900 dark:text-amber-50 mt-2">{stats.expiringDocs.length}</p>
                <p className="text-xs font-semibold text-amber-700/70 mt-2">Requieren actualización</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-t-4 border-t-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Vencidos</p>
                <p className="text-3xl font-black text-red-900 dark:text-red-50 mt-2">{stats.expiredDocs.length}</p>
                <p className="text-xs font-semibold text-red-700/70 mt-2">Acción inmediata</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-base font-semibold">Categorías Documentales</CardTitle>
            <CardDescription>Explora los expedientes por área funcional</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/documents/students">
              <Button variant="outline" className="w-full justify-start gap-3 h-14">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Estudiantes</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Actas, vacunas, médicos</span>
                </div>
              </Button>
            </Link>
            
            <Link href="/documents/staff">
              <Button variant="outline" className="w-full justify-start gap-3 h-14">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Personal</span>
                  <span className="text-[10px] text-muted-foreground font-normal">CVs, contratos, licencias</span>
                </div>
              </Button>
            </Link>

            <Link href="/documents/institutional">
              <Button variant="outline" className="w-full justify-start gap-3 h-14">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span>Institucional</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Políticas, permisos, actas</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className={stats.expiredDocs.length > 0 || stats.expiringDocs.length > 0 ? "border-red-200 shadow-sm" : ""}>
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${stats.expiredDocs.length > 0 ? 'text-red-500' : 'text-amber-500'}`} />
              <CardTitle className="text-base font-semibold">Atención Requerida</CardTitle>
            </div>
            <CardDescription>Documentos que necesitan revisión</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 max-h-[250px] overflow-y-auto custom-scrollbar">
            {stats.expiredDocs.length === 0 && stats.expiringDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <ShieldAlert className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-emerald-700">Todos los documentos están al día</p>
                <p className="text-xs text-muted-foreground">No hay vencimientos pendientes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.expiredDocs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Vencidos</h4>
                    <ul className="space-y-2">
                      {stats.expiredDocs.map((doc: any) => (
                        <li key={doc.id} className="text-sm flex flex-col sm:flex-row sm:items-center justify-between bg-red-50 dark:bg-red-900/10 p-2 rounded-md border border-red-100 dark:border-red-900/30">
                          <div>
                            <span className="font-medium text-red-900 dark:text-red-300 line-clamp-1">{doc.title}</span>
                            <span className="text-[10px] text-red-600/80">{doc.categoryName}</span>
                          </div>
                          <span className="text-red-600 font-bold text-xs mt-1 sm:mt-0">{new Date(doc.expirationDate).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {stats.expiringDocs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Por vencer</h4>
                    <ul className="space-y-2">
                      {stats.expiringDocs.map((doc: any) => (
                        <li key={doc.id} className="text-sm flex flex-col sm:flex-row sm:items-center justify-between bg-amber-50 dark:bg-amber-900/10 p-2 rounded-md border border-amber-100 dark:border-amber-900/30">
                          <div>
                            <span className="font-medium text-amber-900 dark:text-amber-300 line-clamp-1">{doc.title}</span>
                            <span className="text-[10px] text-amber-600/80">{doc.categoryName}</span>
                          </div>
                          <span className="text-amber-600 font-bold text-xs mt-1 sm:mt-0">{new Date(doc.expirationDate).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
