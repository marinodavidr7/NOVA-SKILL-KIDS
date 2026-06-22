'use client'

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Bell, MessageSquare, ChevronDown, LogOut, Settings as SettingsIcon, Menu, Calendar, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { getNotifications } from "@/lib/actions/notifications";
import { getCurrentUser } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>('light');
  const [profile, setProfile] = useState({
    nombre: "",
    cargo: "",
    foto: ""
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTheme(localStorage.getItem("app_theme") || 'light');
    }
    const handleThemeChange = () => {
      setTheme(localStorage.getItem("app_theme") || 'light');
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      if (user) {
        setProfile({
          nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          cargo: user.title || (user.role === 'admin' ? 'Administrador' : 'Personal'),
          foto: user.avatar || ""
        });
      }
    }
    loadUser();
    
    const loadLogo = () => {
      setLogoUrl(`/uploads/custom-logo.png?v=${Date.now()}`);
    };
    loadLogo();
    window.addEventListener('logo_updated', loadLogo);
    
    async function fetchCount() {
      try {
        const notifs = await getNotifications();
        const unread = notifs.filter(n => n.unread).length;
        setUnreadCount(unread);
      } catch (e) {
        console.error(e);
      }
    }
    fetchCount();

    const handleNotificationRead = () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    };
    
    window.addEventListener('notification-read', handleNotificationRead);

    // Profile Sync
    const loadProfileSync = () => {
      loadUser();
    };
    
    window.addEventListener('settings_updated', loadProfileSync);

    // Timer for live clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      window.removeEventListener('notification-read', handleNotificationRead);
      window.removeEventListener('settings_updated', loadProfileSync);
      window.removeEventListener('logo_updated', loadLogo);
      clearInterval(timer);
    };
  }, []);
  const formatDate = (date: Date) => {
    const str = date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    return str.charAt(0).toUpperCase() + str.slice(1).replace('.', '');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-6">
      {/* Left — Breadcrumb / Page Title & Mobile Menu */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden -ml-2 mr-1 p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white overflow-hidden shrink-0 p-0.5 border border-slate-200/80">
            <img src="/nova-logo.png" alt="Nova Skill" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-xl font-brand font-black tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Nova Skill
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1 font-medium shadow-sm ml-1">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span suppressHydrationWarning>{formatDate(currentTime)}</span>
          <span className="text-slate-300 font-light">|</span>
          <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span suppressHydrationWarning>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Center — Dominican Flag Badge / Valentine Badge for Themes */}
      <div className="hidden md:flex flex-1 justify-center items-center">
        {theme === 'patrio' && (
          <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm backdrop-blur-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-default select-none">
            <svg viewBox="0 0 30 20" className="h-5 w-7.5 rounded-[3px] shadow-sm shrink-0 border border-slate-200/40">
              <rect x="0" y="0" width="13" height="8" fill="#002F6C"/>
              <rect x="17" y="0" width="13" height="8" fill="#CE1126"/>
              <rect x="0" y="12" width="13" height="8" fill="#CE1126"/>
              <rect x="17" y="12" width="13" height="8" fill="#002F6C"/>
              <rect x="0" y="8" width="30" height="4" fill="#FFFFFF"/>
              <rect x="13" y="0" width="4" height="20" fill="#FFFFFF"/>
              {/* Coat of arms leaf outline */}
              <path d="M 13.5,8.5 L 16.5,8.5 L 16,11 L 15,11.5 L 14,11 Z" fill="#00843D" stroke="#EAAA00" strokeWidth="0.2"/>
              {/* Coat of arms center shield */}
              <rect x="14.2" y="8.8" width="1.6" height="1.8" fill="#002F6C"/>
              <path d="M 14.5,9.7 L 15.5,9.7" stroke="#CE1126" strokeWidth="0.3"/>
            </svg>
            <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-blue-700 via-slate-600 to-red-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-slate-400 dark:to-red-400">
              Dios, Patria y Libertad
            </span>
          </div>
        )}
        {theme === 'valentin' && (
          <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-950 rounded-xl px-3 py-1.5 shadow-sm backdrop-blur-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-default select-none">
            <span className="text-base animate-pulse">💖</span>
            <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-rose-600 via-pink-500 to-red-500 bg-clip-text text-transparent dark:from-rose-400 dark:via-pink-400 dark:to-rose-400">
              Amor y Amistad
            </span>
          </div>
        )}
        {theme === 'verano' && (
          <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-950 rounded-xl px-3 py-1.5 shadow-sm backdrop-blur-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-default select-none">
            <span className="text-base animate-bounce duration-1000">☀️</span>
            <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-amber-600 via-orange-500 to-sky-600 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-sky-400 flex items-center gap-1.5">
              ¡Verano Nova Skill! <span className="animate-pulse">⛺</span>
            </span>
          </div>
        )}
      </div>

      {/* Right — Actions & User */}
      <div className="flex items-center gap-1 min-w-[180px] justify-end">
        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label="Notificaciones"
        >
          <Bell className="h-[18px] w-[18px]" />
          {/* Animated red dot + count */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
              <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-rose-400 opacity-30" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-[9px] font-bold text-white shadow-sm shadow-rose-500/40">
                {unreadCount}
              </span>
            </span>
          )}
        </Link>

        {/* Messages / Communications */}
        <Link
          href="/communications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label="Comunicaciones"
        >
          <MessageSquare className="h-[18px] w-[18px]" />
        </Link>

        {/* Vertical Divider */}
        <div className="mx-2 h-7 w-px bg-slate-200" />

        {/* User Info */}
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] outline-none">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold leading-tight text-slate-700 group-hover:text-slate-900">
                {profile.nombre}
              </span>
              <span className="text-[11px] font-medium leading-tight text-slate-400">
                {profile.cargo}
              </span>
            </div>

            <Avatar className="h-9 w-9 ring-2 ring-violet-200/60 ring-offset-2 ring-offset-white transition-all duration-200 group-hover:ring-violet-300">
              <AvatarImage src={profile.foto || undefined} alt={profile.nombre} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
                {profile.nombre ? profile.nombre.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>

            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:text-slate-600 group-hover:translate-y-0.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
            <div className="px-2 py-1.5 text-sm font-semibold text-slate-900">Mi Cuenta</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-slate-600"
              onClick={() => window.location.href = '/settings'}
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={async () => {
                const { logout } = await import('@/lib/actions/auth');
                await logout();
                window.location.href = '/login';
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
