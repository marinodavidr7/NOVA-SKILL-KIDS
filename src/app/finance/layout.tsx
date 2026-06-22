"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Landmark, 
  Calculator,
  LineChart,
  FileText,
  PiggyBank,
  AlertCircle
} from "lucide-react";

const financeNavItems = [
  { href: "/finance", label: "Dashboard", icon: LayoutDashboard },
  { href: "/finance/accounts", label: "Caja y Bancos", icon: Landmark },
  { href: "/finance/income", label: "Ingresos", icon: ArrowDownToLine },
  { href: "/finance/receivables", label: "Cuentas por Cobrar", icon: AlertCircle },
  { href: "/finance/expenses", label: "Gastos", icon: ArrowUpFromLine },
  { href: "/finance/loans", label: "Préstamos", icon: Wallet },
  { href: "/finance/budgets", label: "Presupuesto", icon: Calculator },
  { href: "/finance/cashflow", label: "Flujo de Caja", icon: LineChart },
  { href: "/finance/reports", label: "Estados Financ.", icon: FileText },
  { href: "/finance/petty-cash", label: "Caja Chica", icon: PiggyBank },
];

export default function FinanceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen -m-6 lg:-m-8 print:m-0 print:min-h-0 print:bg-white">
      {/* Finance Top Navigation Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Finanzas</h2>
              <p className="text-sm text-slate-500">Gestión contable y financiera</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs - Horizontal Scroll on Mobile */}
        <div className="px-6 lg:px-8 overflow-x-auto no-scrollbar border-t border-slate-100">
          <div className="flex space-x-1 py-2 min-w-max">
            {financeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/finance' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100 text-slate-600 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700"
                  data-active={isActive}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 print:p-0">
        {children}
      </main>
    </div>
  );
}
