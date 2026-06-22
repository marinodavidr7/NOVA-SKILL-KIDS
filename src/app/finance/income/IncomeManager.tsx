'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Receipt, CheckCircle2, CircleDashed, RefreshCw, FileText, Plus, Clock } from 'lucide-react';
import { generateMonthlyTuitions, payTuition } from '@/lib/actions/finance-erp';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function IncomeManager({ 
  incomes, 
  tuitionStatus, 
  currentPeriod,
  accounts
}: { 
  incomes: any[], 
  tuitionStatus: any[], 
  currentPeriod: string,
  accounts: any[]
}) {
  const router = useRouter();
  
  // Dashboard Metrics
  const totalPaid = incomes.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = incomes.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Modal State
  const [isPaying, setIsPaying] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Transferencia');
  const [payAccount, setPayAccount] = useState(accounts[0]?.id?.toString() || '');
  
  // Generation Modal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genPeriod, setGenPeriod] = useState(currentPeriod);
  const [genAmount, setGenAmount] = useState('3000');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredChildren = tuitionStatus.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = async () => {
    setIsSubmitting(true);
    try {
      await generateMonthlyTuitions(genPeriod, parseFloat(genAmount) || 0);
      setIsGenerating(false);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = async (childId: string) => {
    setIsSubmitting(true);
    try {
      const amountNum = parseFloat(payAmount) || 0;
      await payTuition({
        childId: childId,
        amount: amountNum,
        period: currentPeriod,
        method: payMethod,
        accountId: parseInt(payAccount, 10)
      });
      setIsPaying(null);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ingresos y Cobros</h2>
          <p className="text-sm text-slate-500">Punto de venta y gestión de facturación</p>
        </div>
        <div className="flex gap-2">
          {isGenerating ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 bg-white p-1 rounded-md shadow-sm border border-slate-200">
              <Input 
                type="month" 
                value={genPeriod}
                onChange={e => setGenPeriod(e.target.value)}
                className="w-32 h-8 text-sm"
              />
              <Input 
                type="number" 
                value={genAmount}
                onChange={e => setGenAmount(e.target.value)}
                className="w-24 h-8 text-sm"
                placeholder="Monto Base"
              />
              <Button 
                size="sm" 
                onClick={handleGenerate}
                disabled={isSubmitting}
                className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Generar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsGenerating(false)} className="h-8">Cancelar</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsGenerating(true)} className="text-slate-600 bg-white shadow-sm border-slate-200">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar Mensualidades
            </Button>
          )}
          <Link href="/finance/income/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ingreso
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Ingresos Cobrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Ingresos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">${totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Table */}
      <Card className="border-0 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Control de Colegiaturas ({filteredChildren.filter(c => c.isPaid).length}/{filteredChildren.length} Pagados)</h3>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar niño..." 
              className="pl-9 bg-slate-50 border-transparent focus:bg-white transition-colors rounded-xl h-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Alumno</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead className="text-right">Monto / Recibo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChildren.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                  No hay alumnos activos para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              filteredChildren.map(child => (
                <TableRow key={child.id} className="group">
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                        <AvatarImage src={child.photoUrl || ''} alt={child.firstName} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 font-bold">
                          {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{child.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {child.isPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pagado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <CircleDashed className="h-3.5 w-3.5" /> Pendiente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {child.isPaid ? new Date(child.paymentDetails.date).toLocaleDateString('es-ES') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {child.isPaid ? (
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-semibold text-slate-700">${child.paymentDetails.amount.toLocaleString()}</span>
                        <Link 
                          href={`/finance/receipt/${child.paymentDetails.id}`} 
                          title="Imprimir Recibo"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                        >
                          <Receipt className="h-4 w-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {isPaying === child.id ? (
                          <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                            <Input 
                              type="number" 
                              value={payAmount}
                              onChange={e => setPayAmount(e.target.value)}
                              className="w-24 h-8 text-sm" 
                              placeholder="Monto"
                            />
                            <select 
                              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                              value={payMethod}
                              onChange={e => setPayMethod(e.target.value)}
                            >
                              <option value="Transferencia">Transferencia</option>
                              <option value="Efectivo">Efectivo</option>
                              <option value="Tarjeta">Tarjeta</option>
                            </select>
                            <select 
                              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm max-w-[120px]"
                              value={payAccount}
                              onChange={e => setPayAccount(e.target.value)}
                            >
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                              ))}
                            </select>
                            <Button 
                              size="sm" 
                              onClick={() => handlePay(child.id)}
                              disabled={isSubmitting}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Cobrar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsPaying(null)} className="h-8">Cancelar</Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              // We pre-fill the amount with whatever the generated tuition amount is for this child
                              // But since we just have a global list, we can extract the pending amount from incomes
                              const pendingIncome = incomes.find(i => i.childId === child.id && i.status === 'pending');
                              setPayAmount(pendingIncome ? pendingIncome.amount.toString() : genAmount);
                              setIsPaying(child.id);
                            }}
                            className="h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white"
                          >
                            Registrar Pago
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="border-0 shadow-sm mt-8">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">Historial de Facturación Global</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Concepto</th>
                  <th className="px-6 py-4">Alumno</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.map(income => (
                  <tr key={income.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {new Date(income.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{income.type}</div>
                      <div className="text-xs text-slate-400">{income.description}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {income.firstName ? `${income.firstName} ${income.lastName}` : '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ${income.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {income.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Cobrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {income.status === 'pending' ? (
                        <Button 
                          size="sm" 
                          className="bg-slate-900 text-white hover:bg-slate-800"
                          onClick={() => {
                            setPayAmount(income.amount.toString());
                            setIsPaying(income.childId);
                            // Scroll up smoothly to the payment table
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Cobrar
                        </Button>
                      ) : (
                        <Link href={`/finance/receipt/${income.id}`}>
                          <Button size="sm" variant="outline" className="text-slate-500">
                            <FileText className="h-4 w-4 mr-2" /> Recibo
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                
                {incomes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No hay ingresos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
