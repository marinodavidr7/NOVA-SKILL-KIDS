import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, CalendarCheck, Baby, CreditCard, 
  TrendingUp, TrendingDown, Package, BrainCircuit, 
  UserCog, LineChart, Activity 
} from 'lucide-react';
import { getReportsKPIs } from '@/lib/actions/reports';
import Link from 'next/link';

export default async function ReportsPage() {
  const kpis = await getReportsKPIs();

  const reports = [
    { title: 'Asistencia', desc: 'Reporte de entradas, salidas y tardanzas.', icon: CalendarCheck, colorCls: 'bg-emerald-600', link: '/reports/attendance' },
    { title: 'Matrículas', desc: 'Estadísticas de niños inscritos y retención.', icon: Baby, colorCls: 'bg-blue-600', link: '/reports/enrollment' },
    { title: 'Pagos', desc: 'Historial de pagos de padres y tutores.', icon: CreditCard, colorCls: 'bg-indigo-600', link: '/reports/payments' },
    { title: 'Ingresos', desc: 'Análisis de ingresos por diferentes conceptos.', icon: TrendingUp, colorCls: 'bg-teal-600', link: '/reports/income' },
    { title: 'Egresos', desc: 'Análisis de gastos operativos e inventario.', icon: TrendingDown, colorCls: 'bg-rose-600', link: '/reports/expenses' },
    { title: 'Inventario', desc: 'Estado del stock y valoración de activos.', icon: Package, colorCls: 'bg-amber-600', link: '/reports/inventory' },
    { title: 'Desarrollo infantil', desc: 'Métricas de aprendizaje y evolución.', icon: BrainCircuit, colorCls: 'bg-fuchsia-600', link: '/reports/development' },
    { title: 'Personal', desc: 'Asistencia, nómina y desempeño del staff.', icon: UserCog, colorCls: 'bg-violet-600', link: '/reports/staff' },
    { title: 'Estado financiero', desc: 'Balance general y estado de resultados.', icon: LineChart, colorCls: 'bg-cyan-600', link: '/reports/financial' },
    { title: 'Flujo de caja', desc: 'Seguimiento de liquidez y movimientos diarios.', icon: Activity, colorCls: 'bg-orange-600', link: '/reports/cashflow' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reportes y Estadísticas</h1>
            <p className="text-sm text-slate-500 mt-1">
              Métricas principales y generación de reportes institucionales.
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Niños Activos</p>
                <p className="text-3xl font-black text-blue-900 mt-2">{kpis.activeChildren}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Baby className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Asistencia Hoy</p>
                <p className="text-3xl font-black text-emerald-900 mt-2">{kpis.attendancePercentage}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-gray-50 border-t-4 border-t-slate-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Alertas Inventario</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{kpis.inventoryAlerts}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                <Package className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Balance Mensual</p>
                <p className="text-3xl font-black text-amber-900 mt-2">${kpis.balanceMensual.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <LineChart className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group">
            <div className={`h-2 ${r.colorCls}`} />
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{r.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 min-h-[40px]">{r.desc}</p>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg text-slate-600 flex-shrink-0">
                    <r.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-100">
                {r.link ? (
                  <Link href={r.link}>
                    <Button className="w-full rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors">
                      Generar Reporte (PDF)
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors" disabled>
                    Generar Reporte (PDF)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8 bg-muted/50 py-4 rounded-xl border border-slate-100">
        Nota: La generación y exportación de reportes PDF está en desarrollo activo.
      </div>
    </div>
  );
}
