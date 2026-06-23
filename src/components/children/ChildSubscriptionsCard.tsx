"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Package, Plus, Calendar, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { enrollChildInPackage, SubscriptionPackage } from "@/lib/actions/subscriptions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ChildSubscriptionsCardProps {
  childId: number;
  subscriptions: any[];
  availablePackages: SubscriptionPackage[];
  incomes: any[];
}

export default function ChildSubscriptionsCard({ childId, subscriptions, availablePackages, incomes }: ChildSubscriptionsCardProps) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnroll = async () => {
    if (!selectedPackage) return toast.error("Seleccione un paquete");
    setIsSubmitting(true);
    try {
      const result = await enrollChildInPackage(childId, parseInt(selectedPackage));
      if (result.success) {
        toast.success("Inscripción exitosa");
        setIsSheetOpen(false);
        router.refresh();
      } else {
        toast.error("Error al inscribir: " + result.error);
      }
    } catch (error: any) {
      toast.error("Error de servidor: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingPayments = incomes.filter(i => i.status === 'pending');
  const paidPayments = incomes.filter(i => i.status === 'paid');

  return (
    <Card className="border-0 shadow-sm border-t-4 border-t-indigo-500 mt-6">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <Package className="h-5 w-5" />
          <span>Suscripciones y Paquetes</span>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Inscribir
          </SheetTrigger>
          <SheetContent className="sm:max-w-md w-full p-0 flex flex-col h-full bg-white/60 backdrop-blur-2xl border-l border-white/40 shadow-[0_0_40px_rgba(0,0,0,0.1)]">
            <div className="relative overflow-hidden flex-none">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 z-0 opacity-10" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2000ms' }} />
              
              <SheetHeader className="relative z-10 p-6 pb-6 pt-12">
                <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700 flex items-center gap-2">
                  <Package className="w-6 h-6 text-indigo-600" />
                  Inscribir a Paquete
                </SheetTitle>
                <SheetDescription className="text-slate-600 mt-2 text-base">
                  Selecciona el paquete ideal. Se generarán los cargos correspondientes automáticamente.
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3 custom-scrollbar" style={{ paddingBottom: '120px' }}>
              {availablePackages.map((p) => {
                const isSelected = selectedPackage === p.id?.toString();
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPackage(p.id!.toString())}
                    className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-300 group overflow-hidden
                      ${isSelected 
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_30px_rgb(99,102,241,0.2)] scale-[1.02] border-transparent' 
                        : 'bg-white/80 hover:bg-white border border-slate-200/60 hover:border-indigo-300 hover:shadow-lg shadow-sm hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {/* Background glows for selected state */}
                    {isSelected && (
                      <>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2" />
                      </>
                    )}

                    <div className="relative z-10 flex items-start gap-4">
                      <div className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors duration-300 flex-shrink-0
                        ${isSelected ? 'border-white bg-white/20' : 'border-slate-300 group-hover:border-indigo-400'}
                      `}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className={`font-semibold text-lg truncate transition-colors duration-300
                            ${isSelected ? 'text-white' : 'text-slate-800'}
                          `}>
                            {p.name}
                          </h4>
                          <span className={`font-bold text-lg whitespace-nowrap transition-colors duration-300
                            ${isSelected ? 'text-white' : 'text-indigo-600'}
                          `}>
                            ${p.total_fee}
                          </span>
                        </div>
                        {p.description && (
                          <p className={`text-sm line-clamp-2 transition-colors duration-300
                            ${isSelected ? 'text-white/80' : 'text-slate-500'}
                          `}>
                            {p.description}
                          </p>
                        )}
                        
                        {isSelected && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/90 bg-white/10 w-fit px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Seleccionado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {availablePackages.length === 0 && (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                  <Package className="w-12 h-12 text-slate-300 mb-3" />
                  <p>No hay paquetes disponibles.</p>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <Button 
                onClick={handleEnroll} 
                disabled={isSubmitting || !selectedPackage} 
                className={`w-full h-12 text-base font-semibold rounded-xl transition-all duration-300
                  ${!selectedPackage 
                    ? 'bg-slate-100 text-slate-400 border-none hover:bg-slate-100' 
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg hover:shadow-[0_8px_25px_rgb(99,102,241,0.4)] hover:-translate-y-0.5'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  <>Confirmar Inscripción</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No hay suscripciones activas.
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map(sub => (
              <div key={sub.id} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{sub.name}</h4>
                  <p className="text-xs text-slate-500">{sub.description}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagos Pendientes vs Pagados */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
            <h4 className="font-bold text-rose-800 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" /> Pagos Pendientes
            </h4>
            {pendingPayments.length === 0 ? (
              <p className="text-sm text-slate-500">No hay pagos pendientes.</p>
            ) : (
              <ul className="space-y-2">
                {pendingPayments.map(p => (
                  <li key={p.id} className="flex justify-between text-sm bg-white p-2 rounded-lg border border-rose-100 shadow-sm">
                    <span className="text-slate-700">{p.type} <span className="text-xs text-slate-400">({new Date(p.dueDate).toLocaleDateString()})</span></span>
                    <span className="font-bold text-rose-600">${p.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" /> Historial de Pagos
            </h4>
            {paidPayments.length === 0 ? (
              <p className="text-sm text-slate-500">No hay pagos registrados.</p>
            ) : (
              <ul className="space-y-2">
                {paidPayments.map(p => (
                  <li key={p.id} className="flex justify-between text-sm bg-white p-2 rounded-lg border border-emerald-100 shadow-sm">
                    <span className="text-slate-700">{p.type}</span>
                    <span className="font-bold text-emerald-600">${p.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
