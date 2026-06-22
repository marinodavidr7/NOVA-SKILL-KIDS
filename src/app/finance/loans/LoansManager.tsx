'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Calendar, Plus, Wallet, ShieldAlert, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { createLoan, registerLoanPayment } from '@/lib/actions/finance-erp';
import { useRouter } from 'next/navigation';

export default function LoansManager({
  loans,
  accounts,
  payments
}: {
  loans: any[],
  accounts: any[],
  payments: any[]
}) {
  const router = useRouter();

  const activeLoans = loans.filter(l => l.status === 'active');
  const totalDebt = activeLoans.reduce((sum, l) => sum + l.amount, 0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Loan State
  const [showNewLoanForm, setShowNewLoanForm] = useState(false);
  const [newLoan, setNewLoan] = useState({
    lender: '',
    amount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    accountId: accounts[0]?.id?.toString() || ''
  });

  // Payment State
  const [payingLoanId, setPayingLoanId] = useState<number | null>(null);
  const [paymentData, setPaymentData] = useState({
    accountId: accounts[0]?.id?.toString() || '',
    principal: '',
    interest: '',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });

  // History State
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  const handleCreateLoan = async () => {
    if (!newLoan.lender || !newLoan.amount || !newLoan.startDate || !newLoan.endDate) return;
    
    setIsSubmitting(true);
    try {
      await createLoan({
        lender: newLoan.lender,
        amount: parseFloat(newLoan.amount),
        interestRate: parseFloat(newLoan.interestRate) || 0,
        startDate: newLoan.startDate,
        endDate: newLoan.endDate,
        notes: newLoan.notes,
        accountId: parseInt(newLoan.accountId, 10)
      });
      setShowNewLoanForm(false);
      setNewLoan({ ...newLoan, lender: '', amount: '', interestRate: '', endDate: '', notes: '' });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayInstallment = async (loanId: number) => {
    const p = parseFloat(paymentData.principal) || 0;
    const i = parseFloat(paymentData.interest) || 0;
    if (p === 0 && i === 0) return;

    setIsSubmitting(true);
    try {
      await registerLoanPayment({
        loanId,
        accountId: parseInt(paymentData.accountId, 10),
        amount: p + i,
        principal: p,
        interest: i,
        date: paymentData.date,
        reference: paymentData.reference
      });
      setPayingLoanId(null);
      setPaymentData({ ...paymentData, principal: '', interest: '', reference: '' });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHistory = (loanId: number) => {
    setExpandedHistoryId(expandedHistoryId === loanId ? null : loanId);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Préstamos y Deudas</h2>
          <p className="text-sm text-slate-500">Gestión de financiamiento y compromisos a largo plazo</p>
        </div>
        <Button 
          onClick={() => setShowNewLoanForm(!showNewLoanForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          {showNewLoanForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showNewLoanForm ? 'Cancelar' : 'Registrar Préstamo'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-slate-900 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert className="w-24 h-24" /></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Deuda Activa (Monto Inicial)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">${totalDebt.toLocaleString()}</div>
            <p className="text-xs text-slate-400 mt-1">{activeLoans.length} préstamos vigentes</p>
          </CardContent>
        </Card>
      </div>

      {showNewLoanForm && (
        <Card className="border border-emerald-200 shadow-sm animate-in slide-in-from-top-4">
          <CardHeader className="bg-emerald-50/50 pb-4">
            <CardTitle className="text-lg text-emerald-800">Registrar Nuevo Préstamo</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prestamista / Banco</Label>
                <Input 
                  placeholder="Ej. Banco Popular" 
                  value={newLoan.lender} 
                  onChange={e => setNewLoan({...newLoan, lender: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Monto Prestado</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={newLoan.amount} 
                  onChange={e => setNewLoan({...newLoan, amount: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Cuenta Destino (Ingreso)</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newLoan.accountId}
                  onChange={e => setNewLoan({...newLoan, accountId: e.target.value})}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tasa de Interés Anual (%)</Label>
                <Input 
                  type="number" 
                  placeholder="Ej. 18" 
                  value={newLoan.interestRate} 
                  onChange={e => setNewLoan({...newLoan, interestRate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Inicio</Label>
                <Input 
                  type="date" 
                  value={newLoan.startDate} 
                  onChange={e => setNewLoan({...newLoan, startDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Finalización (Estimada)</Label>
                <Input 
                  type="date" 
                  value={newLoan.endDate} 
                  onChange={e => setNewLoan({...newLoan, endDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2 lg:col-span-3">
                <Label>Notas Adicionales</Label>
                <Input 
                  placeholder="Condiciones del préstamo, penalidades, etc." 
                  value={newLoan.notes} 
                  onChange={e => setNewLoan({...newLoan, notes: e.target.value})} 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleCreateLoan} 
                disabled={isSubmitting || !newLoan.lender || !newLoan.amount || !newLoan.startDate || !newLoan.endDate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Guardar Préstamo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <h3 className="text-lg font-semibold text-slate-800 mt-8 mb-4">Préstamos Registrados</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loans.map(loan => {
          const loanPayments = payments.filter(p => p.loanId === loan.id);
          const totalPrincipalPaid = loanPayments.reduce((sum, p) => sum + p.principal, 0);
          const remainingBalance = loan.amount - totalPrincipalPaid;

          return (
            <Card key={loan.id} className="border border-slate-200 shadow-sm flex flex-col">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-slate-800">{loan.lender}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(loan.startDate).toLocaleDateString()} - {new Date(loan.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {loan.status === 'active' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Activo</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Saldado</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase font-semibold mb-1">Monto Inicial</p>
                    <p className="text-lg font-bold text-slate-800">${loan.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase font-semibold mb-1">Tasa (Anual)</p>
                    <p className="text-lg font-bold text-slate-800">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase font-semibold mb-1">Saldo Restante</p>
                    <p className="text-lg font-bold text-rose-600">${remainingBalance.toLocaleString()}</p>
                  </div>
                </div>

                {loan.notes && (
                  <div className="mb-6 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
                    {loan.notes}
                  </div>
                )}

                <div className="mt-auto space-y-4">
                  {loan.status === 'active' && (
                    <>
                      {payingLoanId === loan.id ? (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 space-y-4 animate-in slide-in-from-top-2">
                          <h4 className="font-semibold text-emerald-800 text-sm">Registrar Pago de Cuota</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-emerald-700">Abono al Capital</Label>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                value={paymentData.principal}
                                onChange={e => setPaymentData({...paymentData, principal: e.target.value})}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-emerald-700">Pago de Intereses</Label>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                value={paymentData.interest}
                                onChange={e => setPaymentData({...paymentData, interest: e.target.value})}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-emerald-700">Cuenta Origen</Label>
                              <select 
                                className="flex h-8 w-full rounded-md border border-emerald-200 bg-white px-2 py-1 text-sm text-emerald-900"
                                value={paymentData.accountId}
                                onChange={e => setPaymentData({...paymentData, accountId: e.target.value})}
                              >
                                {accounts.map(a => (
                                  <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-emerald-700">Fecha / Recibo</Label>
                              <div className="flex gap-2">
                                <Input 
                                  type="date" 
                                  value={paymentData.date}
                                  onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                                  className="h-8 text-sm w-full"
                                />
                                <Input 
                                  placeholder="Ref." 
                                  value={paymentData.reference}
                                  onChange={e => setPaymentData({...paymentData, reference: e.target.value})}
                                  className="h-8 text-sm w-20"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 pt-2 border-t border-emerald-100">
                            <Button size="sm" variant="ghost" onClick={() => setPayingLoanId(null)} className="h-8 text-emerald-700">
                              Cancelar
                            </Button>
                            <Button 
                              size="sm" 
                              disabled={isSubmitting || (!paymentData.principal && !paymentData.interest)}
                              onClick={() => handlePayInstallment(loan.id)}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Confirmar Pago (Total: ${(parseFloat(paymentData.principal) || 0) + (parseFloat(paymentData.interest) || 0)})
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              setPayingLoanId(loan.id);
                              setPaymentData({...paymentData, accountId: accounts[0]?.id?.toString() || ''});
                            }}
                          >
                            <Wallet className="h-4 w-4 mr-2" /> Pagar Cuota
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 text-slate-600"
                            onClick={() => toggleHistory(loan.id)}
                          >
                            <Calculator className="h-4 w-4 mr-2" /> Historial
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {expandedHistoryId === loan.id && (
                    <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden animate-in slide-in-from-top-2">
                      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700">Historial de Pagos</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpandedHistoryId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-0">
                        {loanPayments.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">No hay pagos registrados.</div>
                        ) : (
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-500">
                              <tr>
                                <th className="px-3 py-2 font-medium">Fecha</th>
                                <th className="px-3 py-2 font-medium">Capital</th>
                                <th className="px-3 py-2 font-medium">Interés</th>
                                <th className="px-3 py-2 font-medium text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {loanPayments.map(p => (
                                <tr key={p.id}>
                                  <td className="px-3 py-2 text-slate-600">
                                    {new Date(p.date).toLocaleDateString('es-ES')}
                                    {p.reference && <span className="block text-[10px] text-slate-400">Ref: {p.reference}</span>}
                                  </td>
                                  <td className="px-3 py-2 font-medium text-slate-700">${p.principal.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-slate-500">${p.interest.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right font-bold text-slate-800">${p.amount.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {loan.status !== 'active' && expandedHistoryId !== loan.id && (
                     <Button 
                       variant="outline" 
                       className="w-full text-slate-600"
                       onClick={() => toggleHistory(loan.id)}
                     >
                       <Calculator className="h-4 w-4 mr-2" /> Ver Historial
                     </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {loans.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            No hay préstamos registrados
          </div>
        )}
      </div>
    </div>
  );
}
