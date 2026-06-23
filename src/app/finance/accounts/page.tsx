"use client";

import React, { useState, useEffect } from 'react';
import { getAccounts, updateAccount, deleteAccount } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Landmark, Wallet, Plus, ArrowRightLeft, Edit, Trash2, MoreHorizontal, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const BANK_LOGOS: Record<string, string> = {
  "Banreservas": "/Bancos/banreservas-.png",
  "Banco Popular": "/Bancos/Banco-Popular.png",
  "Banco BHD": "/Bancos/bhd-leon-.png",
  "Banco Santa Cruz": "/Bancos/santacruz-.png",
  "Banco Caribe": "/Bancos/logo_bancocaribe-.png",
  "Scotiabank": "/Bancos/Logo_Scotiabank-.png",
  "Banco Vimenca": "/Bancos/banco-vimenca-.png",
  "APAP": "/Bancos/Asociacion-Popular.png",
  "Qik Banco Digital": "/Bancos/qik_logo.svg",
};

const BANK_OPTIONS = [
  "Banreservas",
  "Banco Popular",
  "Banco BHD",
  "Banco Santa Cruz",
  "Banco Caribe",
  "Banco Promerica",
  "Scotiabank",
  "Banesco",
  "Banco Vimenca",
  "Banco Ademi",
  "APAP",
  "ACAP",
  "La Nacional",
  "Qik Banco Digital",
  "Coopnama",
  "Vega Real",
  "Efectivo",
  "Transferencia",
  "Otro"
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit Account Modal State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editBankSelection, setEditBankSelection] = useState('');
  const [editCustomBankName, setEditCustomBankName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editCurrency, setEditCurrency] = useState('DOP');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAccounts = async () => {
    setIsLoading(true);
    const data = await getAccounts();
    setAccounts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleOpenEdit = (acc: any) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditAccountNumber(acc.accountNumber || '');
    setEditCurrency(acc.currency || 'DOP');
    
    if (acc.type === 'bank') {
      const isStandard = BANK_OPTIONS.includes(acc.bankName || '');
      if (isStandard) {
        setEditBankSelection(acc.bankName || '');
        setEditCustomBankName('');
      } else {
        setEditBankSelection(acc.bankName ? 'Otro' : '');
        setEditCustomBankName(acc.bankName || '');
      }
    } else {
      setEditBankSelection('');
      setEditCustomBankName('');
    }
    
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('El nombre de la cuenta es requerido');
      return;
    }
    
    const finalBankName = editingAccount?.type === 'bank'
      ? (editBankSelection === 'Otro' ? editCustomBankName.trim() : editBankSelection)
      : '';

    setIsSaving(true);
    try {
      const res = await updateAccount(editingAccount.id, {
        name: editName,
        bankName: finalBankName,
        accountNumber: editAccountNumber,
        currency: editCurrency
      });

      if (res.success) {
        toast.success('Cuenta actualizada correctamente');
        setIsEditDialogOpen(false);
        loadAccounts();
      } else {
        toast.error(res.error || 'Error al actualizar la cuenta');
      }
    } catch (err) {
      toast.error('Error al actualizar la cuenta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (acc: any) => {
    setAccountToDelete(acc);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteAccount(accountToDelete.id);
      if (res.success) {
        toast.success('Cuenta eliminada correctamente');
        setIsDeleteOpen(false);
        loadAccounts();
      } else {
        toast.error(res.error || 'Error al eliminar la cuenta');
      }
    } catch (err) {
      toast.error('Error al eliminar la cuenta');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalBank = accounts.filter(a => a.type === 'bank').reduce((sum, a) => sum + a.balance, 0);
  const totalCash = accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.balance, 0);
  const total = totalBank + totalCash;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Caja y Bancos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Control unificado de tu liquidez y cuentas bancarias</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/finance/accounts/transfer" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full h-11 px-5 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <ArrowRightLeft className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
              Transferir
            </Button>
          </Link>
          <Link href="/finance/accounts/new" className="flex-1 sm:flex-none">
            <Button className="w-full h-11 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-105 rounded-xl font-medium border-0">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card - Premium Design */}
        <Card className="relative overflow-hidden border-0 shadow-lg group hover:-translate-y-1 transition-transform duration-300 rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 dark:from-slate-950 dark:via-black dark:to-slate-900 z-0"></div>
          {/* Decorative elements */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full z-0 group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full z-0 group-hover:bg-blue-500/30 transition-colors duration-500"></div>
          <div className="absolute top-4 right-4 z-10 opacity-20 group-hover:opacity-40 transition-opacity duration-300 group-hover:scale-110 transform">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          <CardHeader className="pb-2 relative z-10">
            <div className="text-sm font-medium text-slate-300 tracking-wide uppercase">Balance Total Disponible</div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl md:text-5xl font-black text-white tracking-tight bg-clip-text">
              ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Bank Total Card */}
        <Card className="relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
          <div className="absolute -right-4 -bottom-4 z-0 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <Landmark className="w-32 h-32" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total en Bancos</div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              ${totalBank.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Cash Total Card */}
        <Card className="relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
          <div className="absolute -right-4 -bottom-4 z-0 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <Wallet className="w-32 h-32" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total en Efectivo (Caja)</div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              ${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-10 mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-slate-400" />
          Tus Cuentas
        </h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {accounts.map((acc, idx) => (
            <Card 
              key={acc.id} 
              className="group relative overflow-hidden border border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Card gradient accent based on type */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${acc.type === 'bank' ? 'from-blue-400 to-indigo-500' : 'from-emerald-400 to-teal-500'}`}></div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-3">
                    {acc.type === 'bank' && acc.bankName && BANK_LOGOS[acc.bankName] ? (
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-white shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center p-2 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800/50">
                        <Image src={BANK_LOGOS[acc.bankName]} alt={acc.bankName} width={36} height={36} className="object-contain" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-800/50 ${acc.type === 'bank' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                        {acc.type === 'bank' ? <Landmark className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight mt-1">{acc.name}</h4>
                      <div className="flex items-center mt-1.5 gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${acc.type === 'bank' ? 'bg-blue-100/50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                          {acc.type === 'bank' ? 'Banco' : 'Efectivo'}
                        </span>
                        {acc.type === 'bank' && acc.bankName && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">
                            {acc.bankName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions buttons (visible on hover) */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      onClick={() => handleOpenEdit(acc)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                      onClick={() => handleOpenDelete(acc)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                {acc.type === 'bank' && (
                  <div className="mb-4">
                    <p className="font-mono text-sm tracking-widest text-slate-500 dark:text-slate-400 opacity-80">
                      {acc.accountNumber ? `•••• ${acc.accountNumber.slice(-4)}` : '•••• ••••'}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-1">Disponible</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{acc.currency}</span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add New Account Card (Empty State style) */}
          <Link href="/finance/accounts/new" className="block h-full">
            <Card className="h-full min-h-[220px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-900/30 hover:border-emerald-500/50 transition-all duration-300 rounded-2xl group flex flex-col items-center justify-center cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 flex items-center justify-center mb-3 transition-colors duration-300">
                <Plus className="h-6 w-6 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </div>
              <span className="font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Añadir Cuenta</span>
            </Card>
          </Link>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">Editar Cuenta</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Modifica los detalles de tu cuenta o billetera.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">Nombre de la Cuenta *</Label>
              <Input 
                id="name" 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                required 
                className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500"
              />
            </div>
            
            {editingAccount?.type === 'bank' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-slate-700 dark:text-slate-300 font-medium">Nombre del Banco</Label>
                  <select
                    id="bankName"
                    value={editBankSelection}
                    onChange={e => setEditBankSelection(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                  >
                    <option value="">Seleccione un banco...</option>
                    {BANK_OPTIONS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                {editBankSelection === 'Otro' && (
                  <div className="space-y-2">
                    <Label htmlFor="customBank" className="text-slate-700 dark:text-slate-300 font-medium">Especificar Nombre del Banco *</Label>
                    <Input 
                      id="customBank" 
                      value={editCustomBankName} 
                      onChange={e => setEditCustomBankName(e.target.value)}
                      placeholder="Escriba el nombre del banco" 
                      required
                      className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="text-slate-700 dark:text-slate-300 font-medium">Número de Cuenta</Label>
                  <Input 
                    id="accountNumber" 
                    value={editAccountNumber} 
                    onChange={e => setEditAccountNumber(e.target.value)} 
                    className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 font-mono"
                    placeholder="Opcional"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-slate-700 dark:text-slate-300 font-medium">Moneda</Label>
              <select
                id="currency"
                className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                value={editCurrency}
                onChange={e => setEditCurrency(e.target.value)}
              >
                <option value="DOP">DOP - Peso Dominicano</option>
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <DialogFooter className="pt-6 sm:justify-end gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving} className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px] border-rose-100 dark:border-rose-900/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-600 dark:text-rose-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Eliminar Cuenta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 text-slate-600 dark:text-slate-300">
            <p>¿Estás seguro de que deseas eliminar la cuenta <strong className="text-slate-900 dark:text-white font-bold">{accountToDelete?.name}</strong>?</p>
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20">
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                Esta acción es irreversible y solo se completará si la cuenta no contiene movimientos registrados.
              </p>
            </div>
          </div>
          <DialogFooter className="pt-6 sm:justify-end gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting} className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </Button>
            <Button type="button" onClick={handleDeleteConfirm} disabled={isDeleting} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
