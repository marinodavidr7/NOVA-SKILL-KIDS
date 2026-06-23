'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Baby,
  Users,
  CalendarCheck,
  School,
  BookOpen,
  UtensilsCrossed,
  Wallet,
  Package,
  UserCog,
  BarChart3,
  Sparkles,
  LogOut,
  Settings,
  ChevronRight,
  Monitor,
  UserMinus,
  MessageSquare,
  X,
  HeartPulse,
  Bus,
  FileArchive,
  GraduationCap,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/actions/auth'
import { getCentroSettings } from '@/lib/actions/settings'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: string
}

type NavSection = {
  label: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    label: 'PRINCIPAL',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Gestión Académica', href: '/academic', icon: GraduationCap },
      { name: 'Niños', href: '/children', icon: Baby },
      { name: 'Padres / Tutores', href: '/parents', icon: Users },
      { name: 'Egreso de Niños', href: '/discharges', icon: UserMinus },
    ],
  },
  {
    label: 'OPERACIONES',
    items: [
      { name: 'Asistencia', href: '/attendance', icon: CalendarCheck },
      { name: 'Aulas', href: '/classrooms', icon: School },
      { name: 'Educación', href: '/education', icon: BookOpen },
      { name: 'Alimentación', href: '/nutrition', icon: UtensilsCrossed },
      { name: 'Salud', href: '/health', icon: HeartPulse },
    ],
  },
  {
    label: 'ADMINISTRACIÓN',
    items: [
      { name: 'Personal y Nómina', href: '/staff', icon: UserCog },
      { name: 'Finanzas', href: '/finance', icon: Wallet },
      { name: 'Documentos Asociados', href: '/documents', icon: FileArchive },
      { name: 'Activos Fijos', href: '/assets', icon: Monitor },
      { name: 'Inventario', href: '/inventory', icon: Package },
      { name: 'Reportes', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'SERVICIOS',
    items: [
      { name: 'Transporte', href: '/transport', icon: Bus },
    ],
  },
]

export default function Sidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const pathname = usePathname()
  const [centerName, setCenterName] = useState('Nova Skill')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [role, setRole] = useState('admin')
  const [profile, setProfile] = useState({
    nombre: "",
    cargo: "Administrador",
    correo: "",
    foto: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      const user = await getCurrentUser();
      if (user) {
        setRole(user.role);
        setProfile({
          nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          cargo: user.title || (user.role === 'admin' ? 'Administrador' : 'Personal'),
          correo: user.email || "",
          foto: user.avatar || ""
        });
      }
    };

    // Load initial name from database
    const loadName = async () => {
      const centro = await getCentroSettings();
      if (centro && centro.nombre) {
        setCenterName(centro.nombre);
        localStorage.setItem('settings_centro', JSON.stringify(centro));
      }
    }
    
    const loadLogo = () => {
      setLogoUrl(`/uploads/custom-logo.png?v=${Date.now()}`)
    }

    loadName()
    loadLogo()
    loadProfile()

    // Listen for updates from the settings page
    window.addEventListener('settings_updated', loadName)
    window.addEventListener('logo_updated', loadLogo)
    window.addEventListener('settings_updated', loadProfile)
    return () => {
      window.removeEventListener('settings_updated', loadName)
      window.removeEventListener('logo_updated', loadLogo)
      window.removeEventListener('settings_updated', loadProfile)
    }
  }, [])

  return (
    <aside className="flex h-full w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-925 to-slate-950 text-slate-300 shadow-2xl">
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-7 pt-8 pb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white overflow-hidden shrink-0 p-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-full w-full object-cover rounded-xl" onError={() => setLogoUrl(null)} />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <School className="h-7 w-7 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-brand font-black tracking-tight text-white line-clamp-2 leading-tight" title={centerName}>
            {centerName}
          </h1>
          <p className="text-[10px] font-bold tracking-wider text-primary uppercase line-clamp-1">
            Nova Skill
          </p>
        </div>
        {onMobileClose && (
          <button 
            onClick={onMobileClose} 
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      {/* ── Navegación ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 custom-scrollbar">
        <nav className="flex flex-col gap-6 pb-8 pt-2">
          {navigation
            .filter(section => role === 'admin' || section.label !== 'ADMINISTRACIÓN')
            .map((section, sIdx, filteredArray) => (
            <div key={section.label}>
              <h3 className="mb-3 px-3 text-xs font-bold tracking-wider text-slate-500">
                {section.label}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href)

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          group relative flex items-center gap-3 rounded-lg px-3 py-2.5
                          text-[13.5px] font-medium transition-all duration-200 ease-out
                          ${
                            isActive
                              ? 'bg-gradient-to-r from-violet-500/15 to-indigo-500/5 text-white'
                              : 'text-slate-400 hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-slate-100'
                          }
                        `}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-400 to-indigo-500 shadow-sm shadow-violet-400/50" />
                        )}

                        {/* Icon */}
                        <span
                          className={`
                            flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-200
                            ${
                              isActive
                                ? 'bg-violet-500/20 text-violet-300'
                                : 'text-slate-500 group-hover:bg-white/[0.06] group-hover:text-slate-300'
                            }
                          `}
                        >
                          <item.icon className="h-[18px] w-[18px]" />
                        </span>

                        {/* Label */}
                        <span className="flex-1">{item.name}</span>

                        {/* Badge */}
                        {item.badge && (
                          <span
                            className={`
                              rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums
                              ${
                                isActive
                                  ? 'bg-violet-500/25 text-violet-200'
                                  : 'bg-slate-700/60 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                              }
                            `}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Hover arrow */}
                        <ChevronRight
                          className={`
                            h-3.5 w-3.5 transition-all duration-200
                            ${
                              isActive
                                ? 'text-violet-400/60'
                                : 'translate-x-0 text-transparent group-hover:translate-x-0.5 group-hover:text-slate-600'
                            }
                          `}
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* Section separator (except last) */}
              {sIdx < filteredArray.length - 1 && (
                <div className="mt-5 mx-2 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* ── Bottom divider ───────────────────────────────────── */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* ── User Profile ─────────────────────────────────────── */}
      <div className="p-4">
        <div className="group flex items-center gap-3 rounded-xl bg-white/[0.04] px-3.5 py-3 transition-colors duration-200 hover:bg-white/[0.07]">
          <Avatar size="default">
            <AvatarImage src={profile.foto || undefined} alt={profile.nombre} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-[11px] font-bold text-white">
              {profile.nombre ? profile.nombre.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-slate-200">
              {profile.nombre}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {profile.correo}
            </p>
          </div>
          <Link
            href="/settings"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors duration-200 hover:bg-white/[0.08] hover:text-slate-400"
            aria-label="Configuración"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
