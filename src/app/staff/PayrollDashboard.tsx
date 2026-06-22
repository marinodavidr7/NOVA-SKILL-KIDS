'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  UserCog, PlusCircle, Search, Filter, Receipt, 
  WalletCards, CheckCircle2, CircleDollarSign,
  Settings2, Download, MoreHorizontal, Briefcase, Key, FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { deleteStaff, savePayrollPayment } from '@/lib/actions/staff';

export default function PayrollDashboard({ staff, summary, initialPayrollStatus, periodStart, periodEnd }: { staff: any[], summary: any, initialPayrollStatus: any[], periodStart: string, periodEnd: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'directory' | 'payroll'>('directory');
  const [payrollConfig, setPayrollConfig] = useState({
    frequency: 'Mensual', // Mensual, Quincenal, Semanal
    defaultDeductionPercent: 0,
  });
  
  const [showConfig, setShowConfig] = useState(false);

  // Load configuration from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('payroll_config');
    if (saved) {
      try {
        setPayrollConfig(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveConfig = (newConfig: any) => {
    setPayrollConfig(newConfig);
    localStorage.setItem('payroll_config', JSON.stringify(newConfig));
  };

  // State to track bonuses and custom deductions per employee
  // Keys are employee IDs
  const [payrollData, setPayrollData] = useState<Record<string, { bonus: number, deduction: number, status: string }>>({});

  useEffect(() => {
    // Initialize default payroll data mixed with DB state
    const initialData: any = {};
    staff.forEach(s => {
      const dbStatus = initialPayrollStatus.find(p => p.staffId === s.id);
      
      if (dbStatus) {
        initialData[s.id] = {
          bonus: dbStatus.bonuses,
          deduction: dbStatus.deductions,
          status: dbStatus.status
        };
      } else {
        initialData[s.id] = {
          bonus: 0,
          deduction: (s.salary || 0) * (payrollConfig.defaultDeductionPercent / 100),
          status: 'pending'
        };
      }
    });
    setPayrollData(initialData);
  }, [staff, payrollConfig.defaultDeductionPercent, initialPayrollStatus]);

  const handleUpdatePayroll = (id: string, field: 'bonus' | 'deduction', value: string) => {
    const num = parseFloat(value) || 0;
    setPayrollData(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: num }
    }));
  };

  const getNetPay = (s: any, data: any) => {
    let base = s.salary || 0;
    if (payrollConfig.frequency === 'Quincenal') base = base / 2;
    if (payrollConfig.frequency === 'Semanal') base = base / 4;
    return { base, net: base + data.bonus - data.deduction };
  };

  const markAsPaid = async (s: any) => {
    const data = payrollData[s.id];
    const { base, net } = getNetPay(s, data);
    
    // Save to DB
    await savePayrollPayment({
      staffId: s.id,
      baseSalary: base,
      bonuses: data.bonus,
      deductions: data.deduction,
      netPay: net,
      periodStart,
      periodEnd
    });
    
    setPayrollData(prev => ({
      ...prev,
      [s.id]: { ...prev[s.id], status: 'paid' }
    }));
  };

  const processAll = async () => {
    for (const s of staff) {
      if (payrollData[s.id]?.status !== 'paid') {
        await markAsPaid(s);
      }
    }
  };

  // Account Creation Modal State
  const [accountModal, setAccountModal] = useState<{isOpen: boolean, staffId: number | null, name: string}>({
    isOpen: false, staffId: null, name: ''
  });
  const [accountUsername, setAccountUsername] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountRole, setAccountRole] = useState('teacher');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountResult, setAccountResult] = useState<{success: boolean, message: string, username?: string, password?: string} | null>(null);

  const handleCreateAccount = (staffId: number, name: string) => {
    setAccountModal({ isOpen: true, staffId, name });
    
    // Generar correo: Inicial del primer nombre + primer apellido (ej. Elena David -> edavid)
    const nameParts = name.trim().split(/\s+/);
    const firstInitial = nameParts[0] ? nameParts[0].charAt(0).toLowerCase() : '';
    const firstLastName = nameParts.length > 1 ? nameParts[1].toLowerCase() : '';
    const institutionalEmail = `${firstInitial}${firstLastName}@estancia.com`;
    
    setAccountUsername(institutionalEmail);
    
    setAccountRole('teacher');
    setAccountPassword('');
    setAccountResult(null);
  };

  const submitCreateAccount = async () => {
    if (!accountModal.staffId || !accountPassword || !accountUsername) return;
    setIsCreatingAccount(true);
    setAccountResult(null);
    try {
      const { createAccountForStaff } = await import('@/lib/actions/auth');
      const res = await createAccountForStaff(accountModal.staffId, accountPassword, accountRole, accountUsername);
      if (res.success) {
        setAccountResult({
          success: true, 
          message: '¡Cuenta generada con éxito!',
          username: res.username,
          password: accountPassword
        });
      } else {
        setAccountResult({
          success: false,
          message: `Error: ${res.error}`
        });
      }
    } catch (e) {
      setAccountResult({
        success: false,
        message: 'Error al conectar con el servidor.'
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const closeAccountModal = () => {
    setAccountModal({ isOpen: false, staffId: null, name: '' });
    setAccountResult(null);
  };

  const [filterStatus, setFilterStatus] = useState('all');
  const [printingId, setPrintingId] = useState<string | null>(null);

  const handlePrint = (id: string) => {
    setPrintingId(id);
    setTimeout(() => {
      window.print();
      setPrintingId(null);
    }, 800);
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    const isPaid = payrollData[s.id]?.status === 'paid';
    if (filterStatus === 'paid') return matchesSearch && isPaid;
    if (filterStatus === 'pending') return matchesSearch && !isPaid;
    return matchesSearch;
  });

  // Calculate totals
  const totals = useMemo(() => {
    let totalBase = 0;
    let totalNet = 0;
    let totalDeductions = 0;
    let paidCount = 0;

    staff.forEach(s => {
      const data = payrollData[s.id] || { bonus: 0, deduction: 0, status: 'pending' };
      // Adjust salary based on frequency
      let base = s.salary || 0;
      if (payrollConfig.frequency === 'Quincenal') base = base / 2;
      if (payrollConfig.frequency === 'Semanal') base = base / 4;

      const net = base + data.bonus - data.deduction;
      
      totalBase += base;
      totalDeductions += data.deduction;
      totalNet += net;
      if (data.status === 'paid') paidCount++;
    });

    return { totalBase, totalDeductions, totalNet, paidCount };
  }, [staff, payrollData, payrollConfig]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
            <WalletCards className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Personal y Nómina</h1>
            <p className="text-sm text-slate-500">
              Administración de empleados, salarios y recibos de pago.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 rounded-xl border-slate-200"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings2 className="h-4 w-4" /> Configuración
          </Button>
          <Link href="/staff/new">
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-sm rounded-xl text-white">
              <PlusCircle className="h-4 w-4" /> Nuevo Empleado
            </Button>
          </Link>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit">
        <button 
          onClick={() => setViewMode('directory')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'directory' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Directorio
        </button>
        <button 
          onClick={() => setViewMode('payroll')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'payroll' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Gestión de Nómina
        </button>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <Card className="border-0 shadow-sm border-t-4 border-t-slate-800 animate-fade-in bg-slate-50">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4 text-slate-700">Configuración de Nómina (Guardado Automáticamente)</h3>
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">Frecuencia de Pago</label>
                <select 
                  className="flex h-10 w-[200px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={payrollConfig.frequency}
                  onChange={(e) => saveConfig({...payrollConfig, frequency: e.target.value})}
                >
                  <option value="Mensual">Mensual (100% Salario)</option>
                  <option value="Quincenal">Quincenal (50% Salario)</option>
                  <option value="Semanal">Semanal (25% Salario)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">Deducción Base por Defecto (%)</label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  value={payrollConfig.defaultDeductionPercent}
                  onChange={(e) => saveConfig({...payrollConfig, defaultDeductionPercent: parseFloat(e.target.value) || 0})}
                  className="w-[150px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Directory Grid */}
      {viewMode === 'directory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
          {filteredStaff.map(s => {
            const initials = `${(s.firstName?.[0] || "").toUpperCase()}${(s.lastName?.[0] || "").toUpperCase()}`;
            return (
              <Card key={s.id} className="border-0 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                <div className="h-20 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                <CardContent className="px-5 pb-5 pt-0 relative flex flex-col items-center">
                  <div className="flex flex-col items-center -mt-10 mb-3 w-full">
                    <div className="flex justify-center w-full relative">
                      <Avatar className="h-20 w-20 ring-4 ring-white shadow-md bg-white">
                        {s.photoUrl && <AvatarImage src={s.photoUrl} alt={`${s.firstName} ${s.lastName}`} className="object-cover" />}
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-xl font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -right-2 top-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                        {s.status === 'active' ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 text-center w-full">{s.firstName} {s.lastName}</h3>
                  <p className="text-sm font-medium text-violet-600 mb-4 text-center">{s.role}</p>
                  
                  <div className="w-full space-y-2 mb-6">
                    {s.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 justify-center">
                        <span className="truncate">{s.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 py-1.5 px-3 rounded-lg w-full">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">Ingreso: {s.hireDate ? new Date(s.hireDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <Link href={`/staff/${s.id}`} className="w-full">
                    <Button variant="outline" className="w-full bg-slate-50 hover:bg-slate-900 hover:text-white transition-colors gap-2 text-slate-700 border-slate-200">
                      <FolderOpen className="h-4 w-4" /> Ver Expediente
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
          {filteredStaff.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No se encontraron empleados en el directorio.</p>
            </div>
          )}
        </div>
      )}

      {/* Payroll View */}
      {viewMode === 'payroll' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm border-t-4 border-t-violet-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Nómina Total a Pagar</p>
                <p className="text-3xl font-bold text-slate-900">${totals.totalNet.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Frecuencia: {payrollConfig.frequency}</p>
              </div>
              <div className="p-3 bg-violet-50 rounded-xl">
                <CircleDollarSign className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Empleados Activos</p>
                <p className="text-3xl font-bold text-slate-900">{summary.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-rose-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Deducciones Totales</p>
                <p className="text-3xl font-bold text-slate-900">${totals.totalDeductions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <TrendingDownIcon className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Estado de Pago</p>
                <p className="text-3xl font-bold text-slate-900">{totals.paidCount} / {staff.length}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Pagados</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por nombre o cargo..." 
            className="pl-10 rounded-xl border-slate-200 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto items-center">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select 
              className="pl-10 h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="pending">Solo Pendientes</option>
              <option value="paid">Solo Pagados</option>
            </select>
          </div>
          <Button 
            onClick={processAll}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" /> Procesar Nómina Completa
          </Button>
        </div>
      </div>

      {/* Payroll Table */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-100">
                <TableHead className="pl-6 font-semibold text-slate-600">Empleado</TableHead>
                <TableHead className="font-semibold text-slate-600">Salario Base ({payrollConfig.frequency})</TableHead>
                <TableHead className="font-semibold text-slate-600">Bonos / Extras</TableHead>
                <TableHead className="font-semibold text-slate-600">Deducciones</TableHead>
                <TableHead className="font-semibold text-slate-600">Salario Neto</TableHead>
                <TableHead className="font-semibold text-slate-600">Estado</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-slate-600">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    No se encontraron empleados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map(s => {
                  const data = payrollData[s.id] || { bonus: 0, deduction: 0, status: 'pending' };
                  
                  let base = s.salary || 0;
                  if (payrollConfig.frequency === 'Quincenal') base = base / 2;
                  if (payrollConfig.frequency === 'Semanal') base = base / 4;
                  
                  const net = base + data.bonus - data.deduction;
                  const isPaid = data.status === 'paid';

                  return (
                    <TableRow key={s.id} className="hover:bg-slate-50/80 border-slate-100 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarFallback className="bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 font-medium">
                              {s.firstName[0]}{s.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-900">{s.firstName} {s.lastName}</div>
                            <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
                              {s.role}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-slate-700">${base.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">$</span>
                          <Input 
                            type="number" 
                            className="w-20 h-8 text-sm" 
                            value={data.bonus || ''} 
                            placeholder="0"
                            onChange={(e) => handleUpdatePayroll(s.id, 'bonus', e.target.value)}
                            disabled={isPaid}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">$</span>
                          <Input 
                            type="number" 
                            className="w-20 h-8 text-sm text-rose-600 border-rose-100 focus-visible:ring-rose-500" 
                            value={data.deduction || ''} 
                            placeholder="0"
                            onChange={(e) => handleUpdatePayroll(s.id, 'deduction', e.target.value)}
                            disabled={isPaid}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-900 text-base">${net.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Pagado
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full w-fit border border-amber-200">
                            <CircleDollarSign className="h-3.5 w-3.5" /> Pendiente
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isPaid && (
                            <Button 
                              size="sm" 
                              onClick={() => markAsPaid(s)}
                              className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                            >
                              Pagar
                            </Button>
                          )}
                          <Link href={`/staff/${s.id}`}>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-blue-200"
                              title="Ver Expediente"
                            >
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/staff/${s.id}/receipt?start=${periodStart}&end=${periodEnd}&bonus=${data.bonus || 0}&deduction=${data.deduction || 0}`}>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900"
                              title="Generar Recibo (Imprimir)"
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            onClick={() => handleCreateAccount(s.id, `${s.firstName} ${s.lastName}`)}
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 border-amber-200"
                            title="Crear/Editar Cuenta de Acceso"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <form action={deleteStaff} className="inline-block">
                            <input type="hidden" name="id" value={s.id} />
                            <Button 
                              type="submit"
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Dar de baja / Eliminar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      </div>
      )}

      {/* Account Creation Modal */}
      <Dialog open={accountModal.isOpen} onOpenChange={(open) => !open && closeAccountModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              Crear Cuenta de Acceso
            </DialogTitle>
            <DialogDescription>
              Genera una cuenta interna para <strong>{accountModal.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {!accountResult ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Correo Electrónico</Label>
                <Input
                  id="username"
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="Ej. elena.david@estancia.com"
                  type="email"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol en el Sistema</Label>
                <select 
                  id="role"
                  value={accountRole}
                  onChange={(e) => setAccountRole(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 appearance-none"
                >
                  <option value="teacher">Educador / Docente</option>
                  <option value="admin">Administrador</option>
                  <option value="assistant">Asistente</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal</Label>
                <Input
                  id="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="Ej. estancia123"
                  type="text"
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  El usuario podrá cambiar esta contraseña desde sus ajustes.
                </p>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-xl border ${accountResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'} mb-4`}>
              <p className={`font-medium ${accountResult.success ? 'text-emerald-800' : 'text-rose-800'} mb-2`}>
                {accountResult.message}
              </p>
              {accountResult.success && (
                <div className="bg-white p-3 rounded-lg text-sm border border-emerald-100 shadow-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Correo:</span>
                    <strong className="text-slate-900">{accountResult.username}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contraseña:</span>
                    <strong className="text-slate-900">{accountResult.password}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="outline" onClick={closeAccountModal}>
              {accountResult ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!accountResult && (
              <Button 
                type="button" 
                onClick={submitCreateAccount} 
                disabled={!accountPassword || isCreatingAccount}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isCreatingAccount ? 'Creando...' : 'Crear Cuenta'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrendingDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}
