'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import { loginWithPin, loginWithPassword, getUsersForSwitcher } from '@/lib/actions/auth';

type ThemeKey = 'light' | 'dark' | 'pink' | 'emerald' | 'violet' | 'ocean' | 'patrio' | 'valentin' | 'verano' | 'midnight' | 'sunset' | 'aurora';

const themeConfigs: Record<ThemeKey, { bg: string; bloom1: string; bloom2: string; heading: string }> = {
  verano: {
    bg: "bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#BAE6FD]",
    bloom1: "bg-amber-400/25",
    bloom2: "bg-sky-400/20",
    heading: "from-amber-600 via-orange-500 to-sky-600"
  },
  patrio: {
    bg: "bg-gradient-to-br from-[#001D44] via-[#0a2f5c] to-[#3b0007]",
    bloom1: "bg-blue-600/30",
    bloom2: "bg-red-600/20",
    heading: "from-blue-300 via-slate-200 to-red-300"
  },
  valentin: {
    bg: "bg-gradient-to-br from-[#3b000b] via-[#1e0005] to-[#5a0016]",
    bloom1: "bg-rose-600/25",
    bloom2: "bg-red-500/20",
    heading: "from-rose-300 via-pink-200 to-red-300"
  },
  pink: {
    bg: "bg-gradient-to-br from-[#27000e] via-[#120006] to-[#35021a]",
    bloom1: "bg-pink-600/20",
    bloom2: "bg-rose-500/15",
    heading: "from-pink-300 via-rose-200 to-rose-300"
  },
  emerald: {
    bg: "bg-gradient-to-br from-[#002213] via-[#000e07] to-[#01351e]",
    bloom1: "bg-emerald-600/20",
    bloom2: "bg-teal-600/15",
    heading: "from-emerald-300 via-teal-200 to-cyan-300"
  },
  violet: {
    bg: "bg-gradient-to-br from-[#1b0030] via-[#0b0014] to-[#2b003a]",
    bloom1: "bg-violet-600/25",
    bloom2: "bg-purple-600/20",
    heading: "from-violet-300 via-purple-200 to-fuchsia-300"
  },
  ocean: {
    bg: "bg-gradient-to-br from-[#001c3d] via-[#000a16] to-[#002f5a]",
    bloom1: "bg-blue-600/25",
    bloom2: "bg-cyan-600/15",
    heading: "from-blue-300 via-sky-200 to-cyan-300"
  },
  dark: {
    bg: "bg-gradient-to-br from-slate-950 via-slate-900 to-black",
    bloom1: "bg-slate-700/10",
    bloom2: "bg-slate-800/10",
    heading: "from-slate-200 via-slate-300 to-white"
  },
  light: {
    bg: "bg-gradient-to-br from-indigo-950 via-slate-900 to-black",
    bloom1: "bg-blue-600/30",
    bloom2: "bg-violet-600/20",
    heading: "from-violet-300 via-indigo-200 to-blue-300"
  },
  midnight: {
    bg: "bg-gradient-to-br from-[#0f111a] via-[#1a1b26] to-[#0a0c10]",
    bloom1: "bg-amber-600/15",
    bloom2: "bg-amber-400/10",
    heading: "from-amber-200 via-amber-400 to-yellow-500"
  },
  sunset: {
    bg: "bg-gradient-to-br from-[#4a0404] via-[#7c1d1d] to-[#c2410c]",
    bloom1: "bg-orange-500/30",
    bloom2: "bg-rose-500/25",
    heading: "from-orange-200 via-orange-400 to-rose-400"
  },
  aurora: {
    bg: "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b]",
    bloom1: "bg-cyan-500/25",
    bloom2: "bg-purple-500/25",
    heading: "from-cyan-300 via-teal-200 to-purple-400"
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isManualAdmin, setIsManualAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'pin'>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // All user data comes exclusively from the database
  const [selectedUser, setSelectedUser] = useState<{ name: string; username: string; avatar: string; hasPin: boolean } | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [theme, setTheme] = useState<ThemeKey>('light');

  const config = themeConfigs[theme] || themeConfigs.light;

  // ── Load users from database and apply theme ──────────────────
  useEffect(() => {
    // Purge stale localStorage user-identity keys (legacy migration)
    localStorage.removeItem('last_logged_in_user');

    // Theme is a UI preference — localStorage is acceptable for this
    if (typeof window !== 'undefined') {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const m = today.getMonth() + 1;
      const d = today.getDate();

      const isPatrioticDay = (m === 1 && d === 26) || (m === 2 && d === 27) || (m === 8 && d === 16) || (m === 11 && d === 6);
      const isValentineDay = (m === 2 && d === 14);
      const isSummerTime = (m === 6 && d >= 21) || (m === 7) || (m === 8 && d !== 16);

      if (isPatrioticDay && localStorage.getItem('last_auto_patrio_date') !== todayStr) {
        localStorage.setItem('app_theme', 'patrio');
        localStorage.setItem('last_auto_patrio_date', todayStr);
      }
      if (isValentineDay && localStorage.getItem('last_auto_valentin_date') !== todayStr) {
        localStorage.setItem('app_theme', 'valentin');
        localStorage.setItem('last_auto_valentin_date', todayStr);
      }
      if (isSummerTime && localStorage.getItem('last_auto_verano_date') !== todayStr) {
        localStorage.setItem('app_theme', 'verano');
        localStorage.setItem('last_auto_verano_date', todayStr);
      }

      const activeTheme = (localStorage.getItem('app_theme') as ThemeKey) || 'light';
      setTheme(activeTheme);

      document.documentElement.classList.remove('dark', 'theme-pink', 'theme-emerald', 'theme-violet', 'theme-ocean', 'theme-patrio', 'theme-valentin', 'theme-verano', 'theme-midnight', 'theme-sunset', 'theme-aurora');
      const classMap: Record<string, string> = {
        dark: 'dark', pink: 'theme-pink', emerald: 'theme-emerald',
        violet: 'theme-violet', ocean: 'theme-ocean', patrio: 'theme-patrio',
        valentin: 'theme-valentin', verano: 'theme-verano',
        midnight: 'theme-midnight', sunset: 'theme-sunset', aurora: 'theme-aurora'
      };
      if (classMap[activeTheme]) document.documentElement.classList.add(classMap[activeTheme]);
    }

    // Load all users from the database — NO localStorage for user data
    setIsLoadingUsers(true);
    getUsersForSwitcher().then(users => {
      setAvailableUsers(users);
      setIsLoadingUsers(false);
    });
  }, []);

  // ── Login handler ─────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || (!selectedUser && !isManualAdmin)) return;
    if (isManualAdmin && !adminUsername) return;

    setIsLoading(true);
    setError('');

    const result = loginMethod === 'pin'
      ? await loginWithPin(isManualAdmin ? adminUsername : selectedUser?.username || '', inputValue)
      : await loginWithPassword(isManualAdmin ? adminUsername : selectedUser?.username || '', inputValue);

    if (result.success) {
      // Session is stored in an HTTP-only cookie on the server — no localStorage
      router.push('/');
    } else {
      setError(result.error || 'Credenciales incorrectas');
      setIsLoading(false);
      setInputValue('');
    }
  };

  const selectUser = (user: any) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.username;
    setSelectedUser({ name, username: user.username, avatar: user.avatar || '', hasPin: user.hasPin });
    setLoginMethod(user.hasPin ? 'pin' : 'password');
    setInputValue('');
    setError('');
  };

  const backToUserList = () => {
    setSelectedUser(null);
    setInputValue('');
    setError('');
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-all duration-700 ease-in-out ${config.bg}`}>

      {/* Seasonal / patriotic badge — top left */}
      {theme === 'patrio' && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5 bg-white/10 border border-white/10 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md cursor-default select-none animate-in fade-in slide-in-from-top-1 duration-300">
          <svg viewBox="0 0 30 20" className="h-5 w-7.5 rounded-[3px] shadow-sm shrink-0 border border-white/10">
            <rect x="0" y="0" width="13" height="8" fill="#002F6C"/>
            <rect x="17" y="0" width="13" height="8" fill="#CE1126"/>
            <rect x="0" y="12" width="13" height="8" fill="#CE1126"/>
            <rect x="17" y="12" width="13" height="8" fill="#002F6C"/>
            <rect x="0" y="8" width="30" height="4" fill="#FFFFFF"/>
            <rect x="13" y="0" width="4" height="20" fill="#FFFFFF"/>
            <path d="M 13.5,8.5 L 16.5,8.5 L 16,11 L 15,11.5 L 14,11 Z" fill="#00843D" stroke="#EAAA00" strokeWidth="0.2"/>
            <rect x="14.2" y="8.8" width="1.6" height="1.8" fill="#002F6C"/>
            <path d="M 14.5,9.7 L 15.5,9.7" stroke="#CE1126" strokeWidth="0.3"/>
          </svg>
          <span className="text-xs font-black tracking-wider uppercase text-white/95 drop-shadow-sm">Dios, Patria y Libertad</span>
        </div>
      )}
      {theme === 'valentin' && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5 bg-white/10 border border-white/10 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md cursor-default select-none animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-base animate-pulse">💖</span>
          <span className="text-xs font-black tracking-wider uppercase text-white/95 drop-shadow-sm">Feliz San Valentín</span>
        </div>
      )}
      {theme === 'verano' && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5 bg-white/10 border border-white/10 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md cursor-default select-none animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-base animate-bounce">☀️</span>
          <span className="text-xs font-black tracking-wider uppercase text-white/95 drop-shadow-sm flex items-center gap-1.5">Campamento de Verano <span className="animate-pulse">⛺</span></span>
        </div>
      )}

      {/* Background bloom */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-700 ${
          theme === 'verano'
            ? 'from-amber-900/40 via-[#2E1065]/60 to-[#0C4A6E]/70 opacity-85'
            : 'from-black/20 via-black/40 to-black/60 opacity-80'
        }`} />
        <div className={`absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full blur-[120px] transition-all duration-700 ${config.bloom1}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] transition-all duration-700 ${config.bloom2}`} />
      </div>

      <div className="z-10 w-full max-w-sm px-6 flex flex-col items-center">

        {/* Logo */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-2xl border border-white/20 overflow-hidden p-2.5 mb-3">
            <img src="/nova-logo.png" alt="Nova Skill Logo" className="h-full w-full object-contain" />
          </div>
          <p className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-1">Bienvenido a</p>
          <h2 className={`text-3xl font-brand font-black tracking-tight bg-gradient-to-r ${config.heading} bg-clip-text text-transparent drop-shadow-sm`}>
            Nova Skill
          </h2>
        </div>

        {/* ── STEP 1: User picker (loaded from DB) ── */}
        {!selectedUser && !isManualAdmin && (
          <div className="w-full space-y-3 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-white/80 text-base font-semibold text-center mb-4 tracking-wide">
              {isLoadingUsers ? 'Cargando usuarios…' : 'Selecciona tu usuario'}
            </h2>

            {isLoadingUsers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 text-white/40 animate-spin" />
              </div>
            ) : availableUsers.length === 0 ? (
              <p className="text-center text-white/50 text-sm py-8">No hay usuarios registrados.</p>
            ) : (
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {availableUsers.map(user => {
                  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.username;
                  const initials = displayName.charAt(0).toUpperCase();
                  return (
                    <button
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-white/25 transition-all text-left group"
                    >
                      <Avatar className="h-12 w-12 border border-white/20 shrink-0">
                        <AvatarImage src={user.avatar} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate group-hover:text-blue-200 transition-colors">{displayName}</div>
                        <div className="text-white/50 text-sm capitalize">
                          {user.role === 'admin' ? 'Administrador' : 'Maestro'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
              <button 
                onClick={() => { setIsManualAdmin(true); setLoginMethod('password'); }} 
                className="text-white/40 hover:text-white/80 text-xs font-medium tracking-wider uppercase transition-colors"
              >
                Acceso Administrador
              </button>
            </div>
          </div>
        )}

        
        {/* ── STEP: Manual Admin Login ── */}
        {isManualAdmin && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-2xl font-semibold text-white tracking-tight text-center drop-shadow-md mb-6">
              Administración
            </h1>
            <form className="w-full relative" onSubmit={handleLogin}>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Usuario"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-lg backdrop-blur-md focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all"
                  autoFocus
                />
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setError(''); }}
                    className={`w-full h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-lg tracking-[0.2em] backdrop-blur-md focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                  />
                  <Button
                    type="submit"
                    disabled={!inputValue || !adminUsername || isLoading}
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 rounded-full bg-transparent hover:bg-white/20 text-white transition-colors"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </form>
            {error && (
              <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-in slide-in-from-bottom-2">
                {error}
              </div>
            )}
            <button 
              onClick={() => { setIsManualAdmin(false); setInputValue(''); setAdminUsername(''); setError(''); }} 
              className="mt-8 text-white/60 hover:text-white text-sm"
            >
              Volver a la lista
            </button>
          </div>
        )}


        {/* ── STEP 2: Password / PIN entry ── */}
        {selectedUser && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">

            {/* Avatar + name */}
            <div className="mb-6 flex flex-col items-center">
              <Avatar className="h-32 w-32 shadow-2xl ring-4 ring-white/10 mb-4 transition-transform duration-500 hover:scale-105">
                <AvatarImage src={selectedUser.avatar || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-4xl text-white font-light">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-semibold text-white tracking-tight text-center drop-shadow-md">
                {selectedUser.name}
              </h1>
            </div>

            {/* Credential form */}
            <div className="w-full space-y-4"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLogin(e as any); } }}
            >
              <div className="relative group">
                <Input
                  type="password"
                  inputMode={loginMethod === 'pin' ? 'numeric' : 'text'}
                  placeholder={loginMethod === 'pin' ? 'PIN' : 'Contraseña'}
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); if (error) setError(''); }}
                  maxLength={loginMethod === 'pin' ? 4 : undefined}
                  className={`w-full h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-lg tracking-[0.2em] backdrop-blur-md focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
                  autoFocus
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  onClick={handleLogin}
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10 rounded-full bg-transparent hover:bg-white/20 text-white transition-colors"
                  disabled={!inputValue || isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                </Button>
              </div>

              {error && (
                <div className="text-center text-red-300 text-sm animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}
            </div>

            {/* Toggle PIN / Password + Change user — bottom links */}
            <div className="mt-12 text-center flex flex-col gap-3">
              {selectedUser.hasPin && (
                <button
                  onClick={() => setLoginMethod(prev => prev === 'pin' ? 'password' : 'pin')}
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors hover:underline underline-offset-4"
                >
                  {loginMethod === 'pin' ? 'Usar Contraseña' : 'Usar PIN'}
                </button>
              )}
              <button
                onClick={backToUserList}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors hover:underline underline-offset-4"
              >
                Cambiar de usuario
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
