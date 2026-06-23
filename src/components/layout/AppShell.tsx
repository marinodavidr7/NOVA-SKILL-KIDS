'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import InactivityTracker from "@/components/layout/InactivityTracker";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReport = pathname?.endsWith('/report') || pathname?.includes('/report/print');
  const isLogin = pathname === '/login';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'pink' | 'emerald' | 'violet' | 'ocean' | 'patrio' | 'valentin' | 'verano' | 'midnight' | 'sunset' | 'aurora'>('light');

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Load theme and listen to theme changes
  useEffect(() => {
    const loadTheme = () => {
      if (typeof window !== 'undefined') {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        
        const m = today.getMonth() + 1;
        const d = today.getDate();
        const isPatrioticDay = (m === 1 && d === 26) || // 26 de enero
                             (m === 2 && d === 27) || // 27 de febrero
                             (m === 8 && d === 16) || // 16 de agosto
                             (m === 11 && d === 6);   // 6 de noviembre
        const isValentineDay = (m === 2 && d === 14); // 14 de febrero
        const isSummerTime = (m === 6 && d >= 21) || (m === 7) || (m === 8 && d !== 16); // 21 de junio al 31 de agosto, excepto 16 de agosto

        if (isPatrioticDay) {
          const lastAuto = localStorage.getItem('last_auto_patrio_date');
          if (lastAuto !== todayStr) {
            localStorage.setItem('app_theme', 'patrio');
            localStorage.setItem('last_auto_patrio_date', todayStr);
            window.dispatchEvent(new Event('theme-changed'));
          }
        }

        if (isValentineDay) {
          const lastAutoValentin = localStorage.getItem('last_auto_valentin_date');
          if (lastAutoValentin !== todayStr) {
            localStorage.setItem('app_theme', 'valentin');
            localStorage.setItem('last_auto_valentin_date', todayStr);
            window.dispatchEvent(new Event('theme-changed'));
          }
        }

        if (isSummerTime) {
          const lastAutoVerano = localStorage.getItem('last_auto_verano_date');
          if (lastAutoVerano !== todayStr) {
            localStorage.setItem('app_theme', 'verano');
            localStorage.setItem('last_auto_verano_date', todayStr);
            window.dispatchEvent(new Event('theme-changed'));
          }
        }
      }

      const savedTheme = localStorage.getItem('app_theme') as 'light' | 'dark' | 'pink' | 'emerald' | 'violet' | 'ocean' | 'patrio' | 'valentin' | 'verano' | 'midnight' | 'sunset' | 'aurora';
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    
    loadTheme();
    
    window.addEventListener('theme-changed', loadTheme);
    return () => window.removeEventListener('theme-changed', loadTheme);
  }, []);

  // Update root classes when theme state changes
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'theme-pink', 'theme-emerald', 'theme-violet', 'theme-ocean', 'theme-patrio', 'theme-valentin', 'theme-verano', 'theme-midnight', 'theme-sunset', 'theme-aurora');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'pink') {
      document.documentElement.classList.add('theme-pink');
    } else if (theme === 'emerald') {
      document.documentElement.classList.add('theme-emerald');
    } else if (theme === 'violet') {
      document.documentElement.classList.add('theme-violet');
    } else if (theme === 'ocean') {
      document.documentElement.classList.add('theme-ocean');
    } else if (theme === 'patrio') {
      document.documentElement.classList.add('theme-patrio');
    } else if (theme === 'valentin') {
      document.documentElement.classList.add('theme-valentin');
    } else if (theme === 'verano') {
      document.documentElement.classList.add('theme-verano');
    } else if (theme === 'midnight') {
      document.documentElement.classList.add('theme-midnight');
    } else if (theme === 'sunset') {
      document.documentElement.classList.add('theme-sunset');
    } else if (theme === 'aurora') {
      document.documentElement.classList.add('theme-aurora');
    }
  }, [theme]);

  if (isReport || isLogin) {
    return (
      <>
        <style>{`body { overflow: auto !important; }`}</style>
        {children}
      </>
    );
  }

  return (
    <>
      <InactivityTracker timeoutMs={15 * 60 * 1000} />
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`
        print:hidden fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible w-full">
        <div className="print:hidden">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto print:p-0 print:m-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
