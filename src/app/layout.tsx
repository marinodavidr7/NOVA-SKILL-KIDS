import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { InlineScript } from "@/components/InlineScript";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Nova Skill Kids — Sistema de Gestión",
  description: "Sistema integral de administración para Nova Skill Kids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <InlineScript html={`(function() {
          try {
            var today = new Date();
            var yyyy = today.getFullYear();
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var dd = String(today.getDate()).padStart(2, '0');
            var todayStr = yyyy + '-' + mm + '-' + dd;
            var m = today.getMonth() + 1;
            var d = today.getDate();
            var isPatrioticDay = (m === 1 && d === 26) ||
                                 (m === 2 && d === 27) ||
                                 (m === 8 && d === 16) ||
                                 (m === 11 && d === 6);
            var isValentineDay = (m === 2 && d === 14);
            var isSummerTime = (m === 6 && d >= 21) || (m === 7) || (m === 8 && d !== 16);
            if (isPatrioticDay) {
              var lastAuto = localStorage.getItem('last_auto_patrio_date');
              if (lastAuto !== todayStr) {
                localStorage.setItem('app_theme', 'patrio');
                localStorage.setItem('last_auto_patrio_date', todayStr);
              }
            }
            if (isValentineDay) {
              var lastAutoValentin = localStorage.getItem('last_auto_valentin_date');
              if (lastAutoValentin !== todayStr) {
                localStorage.setItem('app_theme', 'valentin');
                localStorage.setItem('last_auto_valentin_date', todayStr);
              }
            }
            if (isSummerTime) {
              var lastAutoVerano = localStorage.getItem('last_auto_verano_date');
              if (lastAutoVerano !== todayStr) {
                localStorage.setItem('app_theme', 'verano');
                localStorage.setItem('last_auto_verano_date', todayStr);
              }
            }
            var theme = localStorage.getItem('app_theme') || 'light';
            document.documentElement.classList.remove('dark','theme-pink','theme-emerald','theme-violet','theme-ocean','theme-patrio','theme-valentin','theme-verano');
            if (theme === 'dark') document.documentElement.classList.add('dark');
            else if (theme === 'pink') document.documentElement.classList.add('theme-pink');
            else if (theme === 'emerald') document.documentElement.classList.add('theme-emerald');
            else if (theme === 'violet') document.documentElement.classList.add('theme-violet');
            else if (theme === 'ocean') document.documentElement.classList.add('theme-ocean');
            else if (theme === 'patrio') document.documentElement.classList.add('theme-patrio');
            else if (theme === 'valentin') document.documentElement.classList.add('theme-valentin');
            else if (theme === 'verano') document.documentElement.classList.add('theme-verano');
          } catch (e) {}
        })()`} />
      </head>
      <body className="h-full overflow-hidden flex bg-background">
        <AppShell>{children}</AppShell>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
