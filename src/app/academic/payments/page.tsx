"use client";

import React, { useState, useEffect } from 'react';
import { getPendingAcademicPayments, markAcademicPaymentPaid, markMultipleAcademicPaymentsPaid } from '@/lib/actions/subscriptions';
import { CalendarCheck, DollarSign, Loader2, ArrowLeft, CheckCircle2, User, CreditCard, Banknote, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AcademicPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'Inscripcion' | 'Colegiatura'>('Inscripcion');
  const [expandedStudents, setExpandedStudents] = useState<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, childId: number, totalAmount: number, paymentIds: number[], method: 'Efectivo' | 'Tarjeta', name: string } | null>(null);

  const toggleStudent = (childId: number) => {
    setExpandedStudents(prev => prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]);
  };

  const handleMultiplePay = async () => {
    if (!confirmModal) return;
    setIsProcessing(confirmModal.childId);
    try {
      await markMultipleAcademicPaymentsPaid(confirmModal.paymentIds, confirmModal.method);
      toast.success(`Se registraron ${confirmModal.paymentIds.length} pagos correctamente`);
      setPayments(prev => prev.filter(p => !confirmModal.paymentIds.includes(p.id)));
      setConfirmModal(null);
    } catch (error) {
      console.error("Error processing multiple payments:", error);
      toast.error("Error al registrar los pagos múltiples");
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await getPendingAcademicPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
      toast.error("Error al cargar los pagos pendientes");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (id: number, method: string) => {
    setIsProcessing(id);
    try {
      await markAcademicPaymentPaid(id, method);
      toast.success("Pago registrado correctamente");
      setPayments(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Error al registrar el pago");
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <Link href="/academic" className="p-2.5 mt-1 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <CalendarCheck className="w-6 h-6 text-rose-600" />
                </div>
                Cobros Académicos
              </h1>
              <p className="mt-2 text-slate-500 max-w-2xl">
                Gestiona y registra el pago de inscripciones y colegiaturas pendientes.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('Inscripcion')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'Inscripcion'
                ? 'bg-rose-100 text-rose-700 shadow-sm'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Inscripciones
          </button>
          <button
            onClick={() => setActiveTab('Colegiatura')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'Colegiatura'
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Mensualidades / Colegiaturas
          </button>
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {(() => {
            const filteredPayments = payments.filter(p => activeTab === 'Inscripcion' ? p.type === 'Inscripción' : p.type !== 'Inscripción');
            
            if (filteredPayments.length === 0) {
              return (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Todo al día</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    No hay cobros de {activeTab === 'Inscripcion' ? 'inscripción' : 'colegiatura'} pendientes.
                  </p>
                </div>
              );
            }

            // Group payments by student
            const groupedPayments = filteredPayments.reduce((acc, payment) => {
              const key = payment.childId;
              if (!acc[key]) {
                acc[key] = {
                  childId: payment.childId,
                  firstName: payment.firstName,
                  lastName: payment.lastName,
                  totalAmount: 0,
                  payments: []
                };
              }
              acc[key].payments.push(payment);
              acc[key].totalAmount += parseFloat(payment.amount);
              return acc;
            }, {} as Record<number, any>);

            return Object.values(groupedPayments).map((group: any) => {
              const isExpanded = expandedStudents.includes(group.childId);
              const hasOverdue = group.payments.some((p: any) => new Date(p.dueDate) < new Date() && new Date(p.dueDate).toDateString() !== new Date().toDateString());

              return (
                <div key={group.childId} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200">
                  {/* Accordion Header */}
                  <div 
                    onClick={() => toggleStudent(group.childId)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasOverdue ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{group.firstName} {group.lastName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-slate-500">ID: {group.childId}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-sm font-medium text-slate-600">{group.payments.length} cuotas pendientes</span>
                          {hasOverdue && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                              Vencido
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-500 font-medium mb-1">Total Pendiente</p>
                        <p className={`text-xl font-bold ${hasOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                          ${group.totalAmount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-2 rounded-full hover:bg-slate-200 bg-slate-100 text-slate-500 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                      {group.payments.length > 1 && (
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-indigo-900">¿Pagar Totalidad?</p>
                              <p className="text-xs text-indigo-700">{group.payments.length} cuotas pendientes por ${group.totalAmount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, childId: group.childId, totalAmount: group.totalAmount, paymentIds: group.payments.map((p: any) => p.id), method: 'Efectivo', name: `${group.firstName} ${group.lastName}` }); }}
                              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors shadow-sm"
                            >
                              <Banknote className="w-4 h-4" /> Todo Efectivo
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, childId: group.childId, totalAmount: group.totalAmount, paymentIds: group.payments.map((p: any) => p.id), method: 'Tarjeta', name: `${group.firstName} ${group.lastName}` }); }}
                              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors shadow-sm"
                            >
                              <CreditCard className="w-4 h-4" /> Todo Tarjeta
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="space-y-3">
                        {group.payments.map((payment: any) => {
                          const isOverdue = new Date(payment.dueDate) < new Date() && new Date(payment.dueDate).toDateString() !== new Date().toDateString();
                          
                          let badge = null;
                          let displayDesc = payment.description;
                          const cuotaMatch = payment.description.match(/^Cuota (\d+\/\d+) de paquete (.*)$/);
                          if (cuotaMatch) {
                            badge = `Cuota ${cuotaMatch[1]}`;
                            displayDesc = cuotaMatch[2];
                          } else {
                            const insMatch = payment.description.match(/^Inscripci.n a paquete (.*)$/);
                            if (insMatch) {
                              badge = 'Inscripción';
                              displayDesc = insMatch[1];
                            }
                          }

                          return (
                            <div key={payment.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {badge && (
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                      {badge}
                                    </span>
                                  )}
                                  <span className="text-sm font-medium text-slate-900">{displayDesc}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isOverdue ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'}`}>
                                    Vence: {new Date(payment.dueDate).toLocaleDateString()}
                                  </span>
                                  <span className="font-bold text-slate-900">
                                    ${parseFloat(payment.amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                                {isProcessing === payment.id ? (
                                  <div className="px-4 py-2 bg-slate-100 rounded-lg flex items-center gap-2 text-sm text-slate-600">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handlePay(payment.id, 'Efectivo'); }}
                                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-medium text-slate-600 transition-colors shadow-sm"
                                      title="Cobrar en Efectivo"
                                    >
                                      <Banknote className="w-4 h-4" /> Efectivo
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handlePay(payment.id, 'Tarjeta'); }}
                                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium text-slate-600 transition-colors shadow-sm"
                                      title="Cobrar con Tarjeta"
                                    >
                                      <CreditCard className="w-4 h-4" /> Tarjeta
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>

      <Dialog open={!!confirmModal} onOpenChange={(open) => !open && setConfirmModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Pago Consolidado</DialogTitle>
            <DialogDescription>
              Estás a punto de registrar el pago de varias cuotas en un solo movimiento.
            </DialogDescription>
          </DialogHeader>
          
          {confirmModal && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 my-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Alumno:</span>
                <span className="font-semibold text-slate-900">{confirmModal.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Cuotas a saldar:</span>
                <span className="font-semibold text-slate-900">{confirmModal.paymentIds.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Método de pago:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  {confirmModal.method === 'Efectivo' ? <Banknote className="w-4 h-4 text-emerald-600" /> : <CreditCard className="w-4 h-4 text-indigo-600" />}
                  {confirmModal.method}
                </span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-medium text-slate-900">Total a cobrar:</span>
                <span className="text-xl font-bold text-slate-900">${confirmModal.totalAmount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2">
            <button
              type="button"
              onClick={() => setConfirmModal(null)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleMultiplePay}
              disabled={isProcessing === confirmModal?.childId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isProcessing === confirmModal?.childId ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
              ) : (
                'Confirmar Cobro Múltiple'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
