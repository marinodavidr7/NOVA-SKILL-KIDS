import Link from 'next/link';
import { Apple, Plus, AlertTriangle, Utensils, Calendar as CalendarIcon, Coffee, Sun, Sunset, Baby, ShieldCheck, ChevronRight } from 'lucide-react';
import { getMenusByDate } from '@/lib/actions/nutrition';
import MenuActions from './MenuActions';
import { getCurrentUser } from '@/lib/actions/auth';

function getWeekDates() {
  const curr = new Date();
  const day = curr.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const first = new Date(curr);
  first.setDate(curr.getDate() + diff);

  const dates = [];
  for (let i = 0; i < 5; i++) {
    const next = new Date(first.getTime());
    next.setDate(first.getDate() + i);
    dates.push(next);
  }
  return dates;
}

function getMealIcon(mealType: string) {
  if (mealType.toLowerCase().includes('desayuno')) return Coffee;
  if (mealType.toLowerCase().includes('comida')) return Sun;
  if (mealType.toLowerCase().includes('vespertina')) return Sunset;
  if (mealType.toLowerCase().includes('fórmula') || mealType.toLowerCase().includes('biberón')) return Baby;
  return Utensils;
}

function getMealColor(mealType: string) {
  if (mealType.toLowerCase().includes('desayuno')) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-800' };
  if (mealType.toLowerCase().includes('matutina')) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-500', dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-800' };
  if (mealType.toLowerCase().includes('comida')) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-800' };
  if (mealType.toLowerCase().includes('vespertina')) return { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', icon: 'text-violet-500', dot: 'bg-violet-400', badge: 'bg-violet-100 text-violet-800' };
  if (mealType.toLowerCase().includes('fórmula') || mealType.toLowerCase().includes('biberón')) return { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', icon: 'text-sky-500', dot: 'bg-sky-400', badge: 'bg-sky-100 text-sky-800' };
  return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: 'text-slate-500', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-800' };
}

export default async function NutritionDashboard() {
  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];
  const user = await getCurrentUser();
  const canPlanMenu = user?.role === 'admin' || user?.permissions?.planMenu;

  const weekMenus = await Promise.all(
    weekDates.map(async (dateObj) => {
      const dateStr = dateObj.toISOString().split('T')[0];
      const menus = await getMenusByDate(dateStr);
      return { dateObj, dateStr, menus };
    })
  );

  const totalMenus = weekMenus.reduce((sum, d) => sum + d.menus.length, 0);
  const totalAlerts = weekMenus.reduce((sum, d) => sum + d.menus.filter((m: any) => m.alternatives && m.alternatives.length > 0).length, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Apple className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Nutrición y Salud</h1>
            <p className="text-slate-500 mt-0.5">Planeación semanal de menús y control de alergias.</p>
          </div>
        </div>
        {canPlanMenu && (
          <Link
            href="/nutrition/new"
            className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-rose-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2 shrink-0"
          >
            <Plus className="h-5 w-5" />
            Planear Menú
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Utensils className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{totalMenus}</p>
            <p className="text-xs font-medium text-slate-500">Menús esta semana</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{totalAlerts}</p>
            <p className="text-xs font-medium text-slate-500">Con menú alterno</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-black text-emerald-600">Activo ✓</p>
            <p className="text-xs font-medium text-slate-500">Escudo de seguridad</p>
          </div>
        </div>
      </div>

      {/* Week Calendar - Row Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-slate-300" />
            <h2 className="font-bold text-white text-lg">Menú Semanal</h2>
          </div>
          <span className="text-sm text-slate-400 font-medium">
            {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' }).format(weekDates[0])}
            {' — '}
            {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(weekDates[4])}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {weekMenus.map((dayData, idx) => {
            const dayName = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(dayData.dateObj);
            const dayNum = dayData.dateObj.getDate();
            const monthShort = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(dayData.dateObj);
            const isToday = dayData.dateStr === today;
            const isPast = dayData.dateStr < today;

            return (
              <details key={idx} open={!isPast} className={`group ${isToday ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'} transition-colors`}>
                <summary className="flex gap-6 p-6 cursor-pointer list-none outline-none items-start md:items-center">
                  {/* Day Label - Fixed Width */}
                  <div className="w-28 shrink-0 flex items-start gap-3">
                    <div className={`h-14 w-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${isToday ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : 'bg-slate-100'}`}>
                      <span className={`text-xl font-black leading-none ${isToday ? 'text-white' : 'text-slate-800'}`}>{dayNum}</span>
                      <span className={`text-[9px] font-bold uppercase leading-none mt-0.5 ${isToday ? 'text-rose-200' : 'text-slate-400'}`}>{monthShort}</span>
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-bold capitalize ${isToday ? 'text-rose-600' : 'text-slate-700'}`}>{dayName}</p>
                      {isToday && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Hoy</span>}
                    </div>
                  </div>

                  {/* Expand prompt (visible only when collapsed) */}
                  <div className="flex-1 text-slate-400 text-sm font-medium group-open:hidden flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-slate-200">
                      {dayData.menus.length} Menú{dayData.menus.length !== 1 && 's'}
                    </span>
                    <span className="hidden md:inline">Clic para expandir</span>
                  </div>

                  {/* Toggle Arrow */}
                  <div className="shrink-0 text-slate-400 group-open:rotate-90 transition-transform duration-200">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </summary>

                {/* Menus - Flexible area */}
                <div className="pl-6 md:pl-[8.5rem] pr-6 pb-6 pt-0 min-w-0">
                  {dayData.menus.length === 0 ? (
                    <Link
                      href={`/nutrition/new?date=${dayData.dateStr}`}
                      className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all group"
                    >
                      <Plus className="h-5 w-5 text-slate-300 group-hover:text-rose-400 transition-colors" />
                      <span className="text-sm text-slate-400 group-hover:text-rose-500 font-semibold transition-colors">Agregar menú para este día</span>
                    </Link>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayData.menus.map((menu: any) => {
                        const MealIcon = getMealIcon(menu.mealType);
                        const colors = getMealColor(menu.mealType);
                        const hasAlternatives = menu.alternatives && menu.alternatives.length > 0;

                        return (
                          <div key={menu.id} className="group rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all bg-white overflow-hidden">
                            {/* Card Content */}
                            <div className="p-4">
                              {/* Meal Type Badge */}
                              <div className="flex items-center justify-between mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${colors.badge}`}>
                                  <MealIcon className="h-3.5 w-3.5" />
                                  {menu.mealType}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-sm font-medium text-slate-800 leading-relaxed mb-3">{menu.description}</p>
                              
                              {/* Beverage */}
                              {menu.beverage && menu.beverage.trim() !== '' && (
                                <div className="mb-3">
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Bebida</span>
                                  <p className="text-sm text-slate-700">{menu.beverage}</p>
                                </div>
                              )}

                              {/* Allergen Tags */}
                              {menu.allergens && menu.allergens.trim() !== '' && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {menu.allergens.split(',').filter((a: string) => a.trim()).map((a: string, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                      ⚠ {a.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Alternatives */}
                              {hasAlternatives && (
                                <div className="pt-3 border-t border-rose-100">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Menús Alternos</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {menu.alternatives.map((alt: any) => (
                                      <div key={alt.id} className="bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
                                        <span className="text-xs font-bold text-slate-700">{alt.firstName} {alt.lastName}: </span>
                                        <span className="text-xs text-rose-600 font-medium">{alt.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Actions - always visible */}
                              <MenuActions menuId={menu.id} />
                            </div>
                          </div>
                        );
                      })}

                      {/* Add more button inline */}
                      <Link
                        href={`/nutrition/new?date=${dayData.dateStr}`}
                        className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all group min-h-[80px]"
                      >
                        <Plus className="h-4 w-4 text-slate-300 group-hover:text-rose-400 transition-colors" />
                        <span className="text-xs text-slate-400 group-hover:text-rose-500 font-semibold transition-colors">Agregar</span>
                      </Link>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {/* Security Shield */}
      <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-2xl flex gap-4 items-start">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-900">Escudo de Seguridad Alimentaria — Activo ✓</h3>
          <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
            Cada menú es analizado automáticamente contra los expedientes médicos de todos los alumnos.
            Si se detecta un ingrediente peligroso, el sistema bloquea la publicación y exige un menú alternativo.
          </p>
        </div>
      </div>
    </div>
  );
}
