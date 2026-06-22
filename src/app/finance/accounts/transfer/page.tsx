import { getAccounts, recordTransaction } from '@/lib/actions/finance-erp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function TransferPage() {
  const accounts = await getAccounts();

  async function action(formData: FormData) {
    'use server';
    const sourceId = parseInt(formData.get('sourceId') as string);
    const targetId = parseInt(formData.get('targetId') as string);
    const amount = parseFloat(formData.get('amount') as string);
    
    if (sourceId === targetId) {
      // Avoid transferring to the same account
      return;
    }

    const sourceAcc = accounts.find(a => a.id === sourceId);
    const targetAcc = accounts.find(a => a.id === targetId);

    if (!sourceAcc || !targetAcc) return;

    await recordTransaction({
      accountId: sourceId,
      type: 'transfer',
      amount,
      date: new Date().toISOString().split('T')[0],
      description: `hacia ${targetAcc.name}`,
      category: 'Transferencia',
      targetAccountId: targetId
    });

    redirect('/finance/accounts');
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/finance/accounts">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white shadow-sm border-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transferir Fondos</h2>
          <p className="text-sm text-slate-500">Mueve dinero entre tus cajas y bancos</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-lg">Detalles de la Transferencia</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={action} className="space-y-6">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <div className="space-y-2">
                <Label>Cuenta Origen (Descontar)</Label>
                <select name="sourceId" required className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Selecciona origen...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (${acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pb-2 text-slate-300">
                <ArrowRight className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <Label>Cuenta Destino (Depositar)</Label>
                <select name="targetId" required className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Selecciona destino...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (${acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <Label className="text-center block">Monto a Transferir</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <Input name="amount" type="number" step="0.01" min="0.01" required className="pl-8 h-12 text-lg text-center font-bold" placeholder="0.00" />
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-4 border-t border-slate-100 mt-6">
              <Link href="/finance/accounts">
                <Button variant="outline" type="button" className="w-32">Cancelar</Button>
              </Link>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white w-32">
                Confirmar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
