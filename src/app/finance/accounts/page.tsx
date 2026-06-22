"use client";

import React, { useState, useEffect } from 'react';
import { getAccounts, updateAccount, deleteAccount } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Wallet, Plus, ArrowRightLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Caja y Bancos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Control del dinero físico y cuentas bancarias</p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/accounts/transfer">
            <Button variant="outline" className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transferir
            </Button>
          </Link>
          <Link href="/finance/accounts/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl px-4">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Landmark className="w-24 h-24" /></div>
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-slate-300">Balance Total Disponible</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">${total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total en Bancos</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalBank.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm relative overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total en Efectivo (Caja)</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${totalCash.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4">Cuentas Registradas</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <Card key={acc.id} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${acc.type === 'bank' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'}`}>
                      {acc.type === 'bank' ? <Landmark className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">{acc.name}</h4>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {acc.type === 'bank' ? 'Banco' : 'Efectivo'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions buttons */}
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      onClick={() => handleOpenEdit(acc)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      onClick={() => handleOpenDelete(acc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {acc.type === 'bank' && acc.bankName && (
                  <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <p>{acc.bankName}</p>
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mt-0.5">{acc.accountNumber || 'Sin número'}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{acc.currency}</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">${acc.balance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cuenta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Cuenta *</Label>
              <Input 
                id="name" 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                required 
              />
            </div>
            
            {editingAccount?.type === 'bank' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nombre del Banco</Label>
                  <select
                    id="bankName"
                    value={editBankSelection}
                    onChange={e => setEditBankSelection(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <option value="">Seleccione un banco...</option>
                    {BANK_OPTIONS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                {editBankSelection === 'Otro' && (
                  <div className="space-y-2">
                    <Label htmlFor="customBank">Especificar Nombre del Banco *</Label>
                    <Input 
                      id="customBank" 
                      value={editCustomBankName} 
                      onChange={e => setEditCustomBankName(e.target.value)}
                      placeholder="Escriba el nombre del banco" 
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Número de Cuenta</Label>
                  <Input 
                    id="accountNumber" 
                    value={editAccountNumber} 
                    onChange={e => setEditAccountNumber(e.target.value)} 
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <select
                id="currency"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editCurrency}
                onChange={e => setEditCurrency(e.target.value)}
              >
                <option value="DOP">DOP - Peso Dominicano</option>
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Eliminar Cuenta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 text-sm text-slate-600 dark:text-slate-400">
            <p>¿Estás seguro de que deseas eliminar la cuenta <strong>{accountToDelete?.name}</strong>?</p>
            <p className="text-xs text-rose-500 font-semibold">Esta acción es irreversible y solo se completará si la cuenta no contiene movimientos registrados.</p>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-rose-600 hover:bg-rose-700 text-white">
              {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
