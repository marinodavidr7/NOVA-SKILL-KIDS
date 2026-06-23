"use client";

import React, { useState } from 'react';
import { createAccount } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

export default function NewAccountPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [bankSelection, setBankSelection] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankAccountType, setBankAccountType] = useState('Ahorro');
  const [currency, setCurrency] = useState('DOP');
  const [balance, setBalance] = useState('0');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre de la cuenta es requerido');
      return;
    }

    const finalBankName = type === 'bank'
      ? (bankSelection === 'Otro' ? customBankName.trim() : bankSelection)
      : '';

    setIsSaving(true);
    try {
      const res = await createAccount({
        name: name,
        type: type,
        currency: currency,
        accountNumber: type === 'bank' ? accountNumber : '',
        bankName: finalBankName,
        balance: parseFloat(balance) || 0,
        bankAccountType: type === 'bank' ? bankAccountType : undefined
      });

      if (res.success) {
        toast.success('Cuenta creada correctamente');
        router.push('/finance/accounts');
      } else {
        toast.error(res.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-2xl mx-auto text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-4">
        <Link href="/finance/accounts">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Nueva Cuenta</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Agrega una caja chica o cuenta bancaria</p>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 pb-4">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-200 font-outfit">Detalles de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Nombre de la Cuenta *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="Ej. Caja Principal, Banreservas Nómina" 
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-slate-700 dark:text-slate-300">Tipo *</Label>
                <select 
                  id="type" 
                  required 
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="bank">Banco (Transferencias/Cheques)</option>
                  <option value="cash">Efectivo (Caja Chica/Física)</option>
                </select>
              </div>
            </div>

            {type === 'bank' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-slate-700 dark:text-slate-300">Banco (Opcional)</Label>
                  <select
                    id="bankName"
                    value={bankSelection}
                    onChange={e => setBankSelection(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Seleccione un banco...</option>
                    {BANK_OPTIONS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="text-slate-700 dark:text-slate-300">Número de Cuenta (Opcional)</Label>
                  <Input 
                    id="accountNumber" 
                    value={accountNumber} 
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX" 
                    className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccountType" className="text-slate-700 dark:text-slate-300">Tipo de Cuenta Bancaria</Label>
                  <select 
                    id="bankAccountType" 
                    value={bankAccountType}
                    onChange={e => setBankAccountType(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Ahorro">Ahorro</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>
              </div>
            )}

            {type === 'bank' && bankSelection === 'Otro' && (
              <div className="space-y-2">
                <Label htmlFor="customBank" className="text-slate-700 dark:text-slate-300">Especificar Nombre del Banco *</Label>
                <Input 
                  id="customBank" 
                  value={customBankName} 
                  onChange={e => setCustomBankName(e.target.value)}
                  placeholder="Escriba el nombre del banco" 
                  required
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-slate-700 dark:text-slate-300">Moneda</Label>
                <select 
                  id="currency" 
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="DOP">DOP (Pesos Dominicanos)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="EUR">EUR (Euros)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance" className="text-slate-700 dark:text-slate-300">Saldo Inicial</Label>
                <Input 
                  id="balance" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  required 
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Link href="/finance/accounts">
                <Button variant="outline" type="button" className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5">
                {isSaving ? 'Creando...' : 'Crear Cuenta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
