import { getTransportStats } from '@/lib/actions/transport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Users, Route, MapPin, AlertCircle, Calendar, DollarSign, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TransportMapWrapper from '@/components/TransportMapWrapper';

export default async function TransportDashboard() {
  const stats = await getTransportStats();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Bus className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Transporte Escolar</h1>
            <p className="text-sm text-slate-500 mt-1">
              Control de rutas, vehículos, conductores y asistencia de los niños.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Vehículos</p>
                <p className="text-3xl font-black text-amber-900 dark:text-amber-50 mt-2">{stats.activeVehicles}</p>
                <Link href="/transport/vehicles">
                  <Button variant="link" className="px-0 text-xs h-auto mt-2 text-amber-700 font-semibold hover:text-amber-800">Gestionar flotilla →</Button>
                </Link>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Bus className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Conductores</p>
                <p className="text-3xl font-black text-blue-900 dark:text-blue-50 mt-2">{stats.activeDrivers}</p>
                <Link href="/transport/drivers">
                  <Button variant="link" className="px-0 text-xs h-auto mt-2 text-blue-700 font-semibold hover:text-blue-800">Ver personal →</Button>
                </Link>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Rutas Activas</p>
                <p className="text-3xl font-black text-emerald-900 dark:text-emerald-50 mt-2">{stats.activeRoutes}</p>
                <Link href="/transport/routes">
                  <Button variant="link" className="px-0 text-xs h-auto mt-2 text-emerald-700 font-semibold hover:text-emerald-800">Ver rutas →</Button>
                </Link>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Route className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-t-4 border-t-violet-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-violet-600 uppercase tracking-wider">Niños Asig.</p>
                <p className="text-3xl font-black text-violet-900 dark:text-violet-50 mt-2">{stats.totalAssignedChildren}</p>
                <Link href="/transport/assignments">
                  <Button variant="link" className="px-0 text-xs h-auto mt-2 text-violet-700 font-semibold hover:text-violet-800">Asignaciones →</Button>
                </Link>
              </div>
              <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-t-4 border-t-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-orange-600 uppercase tracking-wider">Gastos</p>
                <p className="text-3xl font-black text-orange-900 dark:text-orange-50 mt-2">—</p>
                <Link href="/transport/expenses">
                  <Button variant="link" className="px-0 text-xs h-auto mt-2 text-orange-700 font-semibold hover:text-orange-800">Ver gastos →</Button>
                </Link>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        <TransportMapWrapper />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-red-100 dark:border-red-900/50">
          <CardHeader className="bg-red-50/50 dark:bg-red-900/10 pb-4 border-b">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base font-semibold text-red-700 dark:text-red-400">Vencimientos Próximos (30 días)</CardTitle>
            </div>
            <CardDescription>Seguros de vehículos y licencias de conducir por vencer.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {stats.expiringInsurances.length === 0 && stats.expiringLicenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay vencimientos próximos.</p>
            ) : (
              <div className="space-y-4">
                {stats.expiringInsurances.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Bus className="h-4 w-4"/> Seguros Vehículos</h4>
                    <ul className="space-y-2">
                      {stats.expiringInsurances.map((v: any, i: number) => (
                        <li key={i} className="text-sm flex justify-between bg-muted/50 p-2 rounded-md">
                          <span>{v.code} - {v.plate}</span>
                          <span className="text-red-600 font-medium">{new Date(v.insuranceExpiration).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {stats.expiringLicenses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Users className="h-4 w-4"/> Licencias Conductores</h4>
                    <ul className="space-y-2">
                      {stats.expiringLicenses.map((d: any, i: number) => (
                        <li key={i} className="text-sm flex justify-between bg-muted/50 p-2 rounded-md">
                          <span>{d.firstName} {d.lastName}</span>
                          <span className="text-red-600 font-medium">{new Date(d.licenseExpiration).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-base font-semibold">Accesos Rápidos Operativos</CardTitle>
            </div>
            <CardDescription>Gestión diaria de las rutas de transporte.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-3">
            <Link href="/transport/attendance">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <div className="flex flex-col items-start">
                  <span>Control de Asistencia</span>
                  <span className="text-xs text-muted-foreground font-normal">Registrar abordaje y llegada diarios</span>
                </div>
              </Button>
            </Link>
            <Link href="/transport/expenses">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <DollarSign className="h-4 w-4 text-orange-600" />
                <div className="flex flex-col items-start">
                  <span>Control de Gastos</span>
                  <span className="text-xs text-muted-foreground font-normal">Combustible, mantenimiento y seguros</span>
                </div>
              </Button>
            </Link>
            <Link href="/transport/assignments">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <MapPin className="h-4 w-4 text-violet-600" />
                <div className="flex flex-col items-start">
                  <span>Asignación de Niños</span>
                  <span className="text-xs text-muted-foreground font-normal">Vincular niños a las rutas</span>
                </div>
              </Button>
            </Link>
            <Link href="/transport/trips">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <MapIcon className="h-4 w-4 text-emerald-600" />
                <div className="flex flex-col items-start">
                  <span>Excursiones y Viajes</span>
                  <span className="text-xs text-muted-foreground font-normal">Gestionar eventos especiales, permisos y cobros</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
