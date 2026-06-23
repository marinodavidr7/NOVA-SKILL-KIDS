import { GraduationCap, Package, Users, CalendarCheck, BookOpen, Clock, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcademicDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 animate-fade-in">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              Gestión Académica
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Centro de control principal para configurar los programas académicos, suscripciones, currículos y gestionar a los estudiantes inscritos.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Programs Card */}
          <Link href="/academic/programs" className="block group">
            <Card className="border-0 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 bg-white h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package className="w-24 h-24 text-indigo-600" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <Package className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Programas y Paquetes</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                  Crea y administra suscripciones, planes anuales, campamentos de verano y precios.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Mass Enrollment Card */}
          <Link href="/academic/enrollment" className="block group">
            <Card className="border-0 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 bg-white h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-24 h-24 text-emerald-600" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Inscripciones Masivas</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                  Inscribe grupos de estudiantes en programas activos rápidamente. (Próximamente)
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Planning Card */}
          <Link href="/academic/planning" className="block group opacity-75">
            <Card className="border-0 shadow-sm hover:shadow-xl hover:shadow-fuchsia-500/10 hover:-translate-y-1 transition-all duration-300 bg-white h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-24 h-24 text-fuchsia-600" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <BookOpen className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Planificación Curricular</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                  Administra las materias, rúbricas de evaluación y diseño académico. (Próximamente)
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Payments Card */}
          <Link href="/academic/payments" className="block group">
            <Card className="border-0 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 bg-white h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CalendarCheck className="w-24 h-24 text-rose-600" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Cobros Académicos</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                  Gestiona y registra el pago de inscripciones y colegiaturas de los programas activos.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

      </div>
    </div>
  );
}
