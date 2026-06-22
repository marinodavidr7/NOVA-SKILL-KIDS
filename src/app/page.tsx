import { getDashboardStats, getUpcomingEvents } from "@/lib/actions/dashboard";
import { getCurrentUser } from "@/lib/actions/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EventsList from "@/components/dashboard/EventsList";
import {
  Baby,
  CalendarCheck,
  Users,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus,
  CreditCard,
  AlertCircle,
  Utensils,
  ClipboardCheck,
  CalendarDays,
  Stethoscope,
  GraduationCap,
  PartyPopper,
  PlusCircle
} from "lucide-react";

const recentActivities = [
  {
    icon: UserPlus,
    description: "Sistema en línea y funcionando",
    time: "Hoy",
    dotColor: "bg-emerald-500",
  },
  {
    icon: AlertCircle,
    description: "Recuerda registrar la asistencia diaria",
    time: "Recordatorio",
    dotColor: "bg-blue-500",
  }
];


function getFormattedDate(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formatted = formatter.format(now);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default async function Dashboard() {
  const formattedDate = getFormattedDate();
  
  // Fetch real data from DB!
  const statsData = await getDashboardStats();
  const dbEvents = await getUpcomingEvents();
  const user = await getCurrentUser();
  const canViewIncome = user?.role === 'admin' || user?.permissions?.viewIncome;

  const stats = [
    {
      label: "Niños Activos",
      value: statsData.activeChildren.toString(),
      icon: Baby,
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/25",
    },
    {
      label: "Asistencia Hoy",
      value: statsData.attendanceToday.toString(),
      icon: CalendarCheck,
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/25",
    },
    {
      label: "Personal Activo",
      value: statsData.activeStaff.toString(),
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/25",
    }
  ];

  if (canViewIncome) {
    stats.push({
      label: "Ingresos Mes",
      value: `$${statsData.monthIncome.toLocaleString()}`,
      icon: CircleDollarSign,
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/25",
    });
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ── Welcome Section ── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">
          Panel Principal 👋
        </h2>
        <p className="text-muted-foreground text-base">
          Aquí tienes el resumen en tiempo real de Nova Skill Kids.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="relative overflow-hidden transition-shadow duration-300 hover:shadow-lg"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.gradient}`}
              />

              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-extrabold tracking-tight">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} ${stat.shadowColor} shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Second Row: Activity + Events ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 transition-shadow duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivities.map((activity, idx) => {
                const ActivityIcon = activity.icon;
                return (
                  <div
                    key={idx}
                    className="group flex items-center gap-4 rounded-lg px-3 py-3 transition-colors duration-200 hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors duration-200 group-hover:bg-background">
                      <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.time}
                      </p>
                    </div>

                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${activity.dotColor}`}
                      />
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${activity.dotColor}`}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="transition-shadow duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Próximos Eventos
            </CardTitle>
            <Link href="/events/new">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-violet-600 hover:bg-violet-50">
                <PlusCircle className="h-4 w-4" />
                Agregar
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <EventsList dbEvents={dbEvents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
